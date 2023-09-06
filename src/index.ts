import {
  IGNISIGN_APPLICATION_ENV,
  IGNISIGN_BROADCASTABLE_ACTIONS,
  IGNISIGN_BROADCASTABLE_ACTIONS_TYPE,
  IGNISIGN_BROADCASTABLE_ACTIONS_NEED_PRIVATE_FILE,
  IGNISIGN_BROADCASTABLE_ACTIONS_SIGNATURE_ERROR,
  IGNISIGN_ERROR_CODES,
  IgnisignDocument_PrivateFileDto,
  IGNISIGN_BROADCASTABLE_ACTIONS_SIGNATURE_FINALIZED
} from "@ignisign/public";

const DEFAULT_IGNISIGN_CLIENT_SIGN_URL = 'https://sign.ignisign.io';
const IFRAME_MIN_WIDTH  = 300; 
const IFRAME_MIN_HEIGHT = 500;

export enum IGNISIGN_JS_EVENTS {
  IGNISIGN_LOADED  = 'IGNISIGN_LOADED',
  IFRAME_TOO_SMALL = 'IFRAME_TOO_SMALL'
}

export type Ignisign_InitSignatureRequestCallback = {
  handlePrivateFileInfoProvisioning   ?: (documentId: string, externalDocumentId: string, signerId : string, signatureRequestId: string) => Promise<IgnisignDocument_PrivateFileDto>;
  handleSignatureRequestError         ?: (errorCode: IGNISIGN_ERROR_CODES, errorContext: any, signerId: string, signatureRequestId: string) => Promise<void>;
  handleSignatureRequestFinalized     ?: (signatureIds: string[], signerId: string, signatureRequestId: string) => Promise<void>;
}

export type Ignisign_iFrameOptions = {
  width  ?: string;
  height ?: string;
}
export class IgnisignJS_SignatureRequest_Initialization_Params {
  htmlElementId           : string;
  signatureRequestId      : string;
  signerId                : string;
  token                   : string;
  signerAuthSecret        : string;
  closeOnFinish           : boolean  = true;
  iFrameMessagesCallbacks : Ignisign_InitSignatureRequestCallback = {};
  iFrameOptions           : Ignisign_iFrameOptions = { width: "100%", height: "500px" }
}

export class IgnisignJs {
  private readonly  _ignisignClientSignUrl : string;
  private _htmlElementId                   : string;
  private _iFrameId                        : string;
  private _iFrameMessagesCallbacks         : Ignisign_InitSignatureRequestCallback = {};
  private _closeOnFinish                   : boolean = true;
  private _elementResizeObserver           : ResizeObserver;
  private _iframeResizeObserver            : ResizeObserver;
  private _signerId                        : string;
  private _signatureRequestId              : string;

  constructor(
    protected appId                 : string, 
    protected env                   : IGNISIGN_APPLICATION_ENV, 
              ignisignClientSignUrl : string = null
  ) {
    this._ignisignClientSignUrl = ignisignClientSignUrl || DEFAULT_IGNISIGN_CLIENT_SIGN_URL;
  }

  public async initSignatureRequest(initParams: IgnisignJS_SignatureRequest_Initialization_Params): Promise<void> {
    const {
      htmlElementId,
      signatureRequestId,
      signerId,
      token,
      signerAuthSecret,
      closeOnFinish,
      iFrameMessagesCallbacks,
      iFrameOptions
    } = initParams;
    
    try {

      if(this._htmlElementId)
        return Promise.reject(`[ERROR][IgnisignJS]: Signature request already initialized`);

      const finalElementId = htmlElementId.startsWith('#') ? htmlElementId.substring(1) : htmlElementId;
      
      const getSignatureRequestLink = (signatureRequestId, signerId, token) => 
       `${this._ignisignClientSignUrl}/signature-requests/${signatureRequestId}/signers/${signerId}/sign?token=${token}&signerSecret=${signerAuthSecret}`;
      
      this._signerId            = signerId;
      this._signatureRequestId  = signatureRequestId;
      this._closeOnFinish       = closeOnFinish;

      this._htmlElementId       = finalElementId;
      const iframeSrc           =  getSignatureRequestLink(signatureRequestId, signerId, token);
      this._iFrameId            = `${finalElementId}-iframe`;
      
      const iframe    = `
        <iframe style="margin: 0 auto;"
          id="${this._iFrameId}"
          allow="publickey-credentials-create allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox allow-top-navigation"
          src="${iframeSrc}"
          title='Ignisign'
          ${iFrameOptions?.width  ? `width="${iFrameOptions.width}"` : ''}
          ${iFrameOptions?.height ? `height="${iFrameOptions.height}"` : ''}
        />
      `;
      const htmlElement = document.getElementById(this._htmlElementId);
      
      if(!htmlElement)
        return Promise.reject(`Element with id ${this._htmlElementId} not found`);

      if(htmlElement?.offsetWidth < IFRAME_MIN_WIDTH) 
        return Promise.reject(`Element with id ${finalElementId} is too small. Min width : ${IFRAME_MIN_WIDTH}px`);

      document.getElementById(this._htmlElementId).innerHTML = iframe;
      
      const iframeElement = document.getElementById(this._iFrameId);

      this._checkIfIframeIsTooSmall();

      this._iFrameMessagesCallbacks = iFrameMessagesCallbacks;

      this._elementResizeObserver = new ResizeObserver(this._checkIfIframeIsTooSmall.bind(this));
      this._elementResizeObserver.observe(htmlElement);

      this._iframeResizeObserver = new ResizeObserver(this._checkIfIframeIsTooSmall.bind(this));
      this._iframeResizeObserver.observe(iframeElement);

      window.addEventListener('message', this._handleEvent.bind(this));

    } catch (e) {
      console.error("[ERROR][IgnisignJS]: Error when initializing signature request", e);
      return Promise.reject(e);
    }
  }

  public cancelSignatureRequest(): void {
    this._closeIframe();
  }

  private _closeIframe(): void {
    if(!this._htmlElementId)
      throw new Error(`[ERROR][IgnisignJS]: No signature request initialized`);

    this._htmlElementId           = null;
    this._iFrameId                = null;
    this._signerId                = null;
    this._signatureRequestId      = null;
    
    this._iFrameMessagesCallbacks = {}; 

    document.getElementById(this._htmlElementId).innerHTML = null;
    window.removeEventListener('message', this._handleEvent.bind(this));

    if(this._elementResizeObserver)
      this._elementResizeObserver.disconnect();

    this._elementResizeObserver = null;

    if(this._iframeResizeObserver)
      this._iframeResizeObserver.disconnect();
    
    this._iframeResizeObserver = null;
  }

  private _finalizeSignatureRequest(infos: IGNISIGN_BROADCASTABLE_ACTIONS_SIGNATURE_FINALIZED): void {
    if(!infos?.data?.signatureIds )
      throw new Error(`event data malformed`);

    if(this._iFrameMessagesCallbacks?.handleSignatureRequestFinalized)
      this._iFrameMessagesCallbacks.handleSignatureRequestFinalized(
        infos.data.signatureIds, 
        this._signerId,
        this._signatureRequestId
      );

    if(this._closeOnFinish)
      this._closeIframe();
  }

  private _manageSignatureRequestError(infos: IGNISIGN_BROADCASTABLE_ACTIONS_SIGNATURE_ERROR): void {
    if(!infos?.data?.errorCode)
      throw new Error(`event data malformed`);

    if(this._iFrameMessagesCallbacks?.handleSignatureRequestError)
      this._iFrameMessagesCallbacks.handleSignatureRequestError(
        infos.data.errorCode, 
        infos?.data?.errorContext, 
        this._signerId,
        this._signatureRequestId
      );

    if(this._closeOnFinish)
      this._closeIframe();
  }

  private async _managePrivateFileInfoProvisioning(infos: IGNISIGN_BROADCASTABLE_ACTIONS_NEED_PRIVATE_FILE): Promise<IgnisignDocument_PrivateFileDto> {
    if(!infos?.data?.documentId)
      throw new Error(`event data malformed`);

    if(!this._iFrameMessagesCallbacks?.handlePrivateFileInfoProvisioning)
      throw new Error(`[ERROR][IgnisignJS]: Callback handlePrivateFileInfoProvisioning not set`); 

    return this._iFrameMessagesCallbacks.handlePrivateFileInfoProvisioning(
      infos.data.documentId,
      infos.data.externalDocumentId || null,
      this._signerId,
      this._signatureRequestId
    );
  }

  private async _handleEvent (event: MessageEvent<IGNISIGN_BROADCASTABLE_ACTIONS_TYPE>): Promise<void> {

    try {
      console.debug('[DEBUG][IgnisignJS]: _handleEvent : ', event);

      if(!event?.data?.type || !event?.data?.data)
        throw new Error(`event malformed`);

      const { type, data } : IGNISIGN_BROADCASTABLE_ACTIONS_TYPE = event.data;
      
      switch (type) {
        case IGNISIGN_BROADCASTABLE_ACTIONS.NEED_PRIVATE_FILE_URL:
          
          const dto : IgnisignDocument_PrivateFileDto = await this._managePrivateFileInfoProvisioning({ type, data });

          const iframeElement = document.querySelector<HTMLIFrameElement>(`#${this._iFrameId}`);
  
          if (!iframeElement)
            throw new Error(`[ERROR][IgnisignJS]: Iframe element with id ${this._iFrameId} not found`);

          iframeElement.contentWindow.postMessage({ ...dto, documentId : data?.documentId }, "*"); 
          
          break;
        case IGNISIGN_BROADCASTABLE_ACTIONS.OPEN_URL:
          if(!data?.url)
            throw new Error(`event data malformed`);

          window.open(data?.url, '_blank');
          break;

        case IGNISIGN_BROADCASTABLE_ACTIONS.SIGNATURE_FINALIZED:
          this._finalizeSignatureRequest({ type, data });
          break;

        case IGNISIGN_BROADCASTABLE_ACTIONS.SIGNATURE_ERROR:
          this._manageSignatureRequestError({ type, data });
          break;
  
        default:
          console.warn(`[WARNING][IgnisignJS]: event brocasted from Ignisign's iFrame ${event.type}-${type}: Not Implemented`);
          break;
      }

    } catch(e) {

      const baseMsg = "[ERROR][IgnisignJS]: Error when handling event from Ignisign Iframe";

      if (!event?.data?.type || !event?.data?.data){

        console.error(`${baseMsg} - Event malformed`, event);
        if(this._iFrameMessagesCallbacks?.handleSignatureRequestError)
          this._iFrameMessagesCallbacks.handleSignatureRequestError(
            IGNISIGN_ERROR_CODES.IGNISIGN_JS_EVENT_MALFORMED, 
            { event }, 
            this._signerId,
            this._signatureRequestId);
      } else {
        const { type, data }: IGNISIGN_BROADCASTABLE_ACTIONS_TYPE = event.data;
        console.error(`${baseMsg}: ${type}`, data, e);
        if(this._iFrameMessagesCallbacks?.handleSignatureRequestError)
          this._iFrameMessagesCallbacks.handleSignatureRequestError(
            IGNISIGN_ERROR_CODES.IGNISIGN_JS_HANDLE_EVENT_ERROR, 
            { type, data, e }, 
            this._signerId,
            this._signatureRequestId);
      }
    }
  }
  
  private _checkIfIframeIsTooSmall() {
    const docElement = document.getElementById(this._iFrameId);

    if(docElement?.offsetHeight < IFRAME_MIN_HEIGHT || docElement?.offsetWidth < IFRAME_MIN_WIDTH) {
      const ignisignLoadedEvent = new CustomEvent(IGNISIGN_JS_EVENTS.IFRAME_TOO_SMALL, {
        detail : {
          width                : docElement?.offsetWidth,
          height               : docElement?.offsetHeight,
          minHeightRecommended : IFRAME_MIN_HEIGHT,
          minWidthRecommended  : IFRAME_MIN_WIDTH
        }
      });
      window.dispatchEvent(ignisignLoadedEvent);
    }
  }

}

window['IgnisignJs'] = IgnisignJs;

const ignisignLoadedEvent = new CustomEvent(IGNISIGN_JS_EVENTS.IGNISIGN_LOADED);
window.dispatchEvent(ignisignLoadedEvent);