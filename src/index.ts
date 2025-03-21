import {
  IGNISIGN_APPLICATION_ENV,
  IGNISIGN_BROADCASTABLE_ACTIONS,
  IgnisignBroadcastableAction_Dto,
  IgnisignBroadcastableAction_PrivateFileRequestDto,
  IgnisignBroadcastableAction_SignatureErrorDto,
  IGNISIGN_ERROR_CODES,
  IgnisignDocument_PrivateFileDto,
  IgnisignBroadcastableAction_SignatureFinalizedDto,
  IGNISIGN_LANGUAGES
} from "@ignisign/public";

const DEFAULT_IGNISIGN_CLIENT_SIGN_URL = 'https://sign.ignisign.io';
const IFRAME_MIN_WIDTH  = 200; 
const IFRAME_MIN_HEIGHT = 400;

export enum IGNISIGN_JS_EVENTS {
  IGNISIGN_LOADED  = 'IGNISIGN_LOADED',
  IFRAME_TOO_SMALL = 'IFRAME_TOO_SMALL'
}

export type IgnisignJS_SignatureSession_Callbacks = {
  handlePrivateFileInfoProvisioning   ?: (documentId: string, externalDocumentId: string, signerId : string, signatureRequestId: string) => Promise<IgnisignDocument_PrivateFileDto>;
  handleSignatureSessionError         ?: (errorCode: IGNISIGN_ERROR_CODES, errorContext: any, signerId: string, signatureRequestId: string) => Promise<void>;
  handleSignatureSessionFinalized     ?: (signatureIds: string[], signerId: string, signatureRequestId: string) => Promise<void>;
}

export type IgnisignJS_SignatureSession_DisplayOptions = {
  showTitle                     ?: boolean;
  showDescription               ?: boolean;
  darkMode                      ?: boolean;
  forceLanguage                 ?: IGNISIGN_LANGUAGES;
  forceShowDocumentInformations ?: boolean;
}

export type IgnisignJS_SignatureSession_Dimensions = {
  width  ?: string;
  height ?: string;
}
export class IgnisignJS_SignatureSession_Initialization_Params {
  htmlElementId            : string;
  signatureRequestId       : string;
  signerId                 : string;
  signatureSessionToken    : string;
  signerAuthSecret         : string;
  sessionCallbacks         : IgnisignJS_SignatureSession_Callbacks = {};
  closeOnFinish           ?: boolean;
  dimensions              ?: IgnisignJS_SignatureSession_Dimensions;
  displayOptions          ?: IgnisignJS_SignatureSession_DisplayOptions;
}

export class IgnisignJs {
  private readonly  _ignisignClientSignUrl : string;
  private _htmlElementId                   : string;
  private _iFrameId                        : string;
  private _iFrameMessagesCallbacks         : IgnisignJS_SignatureSession_Callbacks = {};
  private _closeOnFinish                   : boolean = true;
  private _elementResizeObserver           : ResizeObserver;
  private _iframeResizeObserver            : ResizeObserver;
  private _signerId                        : string;
  private _signatureRequestId              : string;
  private _iFrameOptions                   : IgnisignJS_SignatureSession_Dimensions;

  constructor(
    protected appId                 : string, 
    protected env                   : IGNISIGN_APPLICATION_ENV, 
              ignisignClientSignUrl : string = null
  ) {
    this._ignisignClientSignUrl = ignisignClientSignUrl || DEFAULT_IGNISIGN_CLIENT_SIGN_URL;
  }

  public async initSignatureSession(initParams: IgnisignJS_SignatureSession_Initialization_Params): Promise<void> {
    const {
      htmlElementId,
      signatureRequestId,
      signerId,
      signatureSessionToken,
      signerAuthSecret,
      sessionCallbacks,
      closeOnFinish  = true,
      dimensions     = { width: "100%", height: "500px" },
      displayOptions = {
        showTitle                     : false,
        showDescription               : false,
        darkMode                      : false,
        forceShowDocumentInformations : false
      }
    } = initParams;
    
    try {

      if(this._htmlElementId)
        return Promise.reject(`[ERROR][IgnisignJS]: Signature request already initialized`);

      const finalElementId = htmlElementId.startsWith('#') ? htmlElementId.substring(1) : htmlElementId;
      
      const getSignatureSessionLink = (signatureRequestId: string, signerId: string, token: string, displayOptions : IgnisignJS_SignatureSession_DisplayOptions) => {
        const displayOptionQueries = Object.keys(displayOptions).map(key => `${key}=${displayOptions[key]}`).join('&');
        const completeUrl = `${this._ignisignClientSignUrl}/signature-requests/${signatureRequestId}/signers/${signerId}/sign?token=${token}&signerSecret=${signerAuthSecret}&${displayOptionQueries}`;
        return completeUrl;
      }
      
      this._signerId            = signerId;
      this._signatureRequestId  = signatureRequestId;
      this._closeOnFinish       = closeOnFinish;
      this._iFrameOptions       = dimensions;
      this._htmlElementId       = finalElementId;
      const iframeSrc           = getSignatureSessionLink(signatureRequestId, signerId, signatureSessionToken, displayOptions);
      this._iFrameId            = `${finalElementId}-iframe`;
      
      const iframe = `
        <iframe style="margin: 0 auto;"
          id="${this._iFrameId}"
          allow="publickey-credentials-create allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox allow-top-navigation"
          src="${iframeSrc}"
          title='Ignisign'
          ${this._iFrameOptions?.width  ? `width="${this._iFrameOptions.width}"` : ''}
          ${this._iFrameOptions?.height ? `height="${this._iFrameOptions.height}"` : ''}
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

      this._iFrameMessagesCallbacks = sessionCallbacks;

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

  public updateSize(iFrameOptions : IgnisignJS_SignatureSession_Dimensions ): void {
    if(!this._iFrameId)
      throw new Error(`[ERROR][IgnisignJS]: No signature request initialized`);

    const iframeElement = document.querySelector<HTMLIFrameElement>(`#${this._iFrameId}`);

    if (!iframeElement)
      throw new Error(`[ERROR][IgnisignJS]: No signature request initialized`);

    this._iFrameOptions = iFrameOptions;

    if(this._iFrameOptions?.width)
      iframeElement.width = this._iFrameOptions.width;

    if(this._iFrameOptions?.height)
      iframeElement.height = this._iFrameOptions.height;
  }

  public cancelSignatureSession(): void {
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
    
    if(!document.getElementById(this._htmlElementId)?.innerHTML) 
      return;

    document.getElementById(this._htmlElementId).innerHTML = "";
    window.removeEventListener('message', this._handleEvent.bind(this));

    if(this._elementResizeObserver)
      this._elementResizeObserver.disconnect();

    this._elementResizeObserver = null;

    if(this._iframeResizeObserver)
      this._iframeResizeObserver.disconnect();
    
    this._iframeResizeObserver = null;
  }


  private async _handleEvent (event: MessageEvent<IgnisignBroadcastableAction_Dto>): Promise<void> {
    try {

      if(!event?.data?.type || !event?.data?.data)
        return;

      const { type, data } : IgnisignBroadcastableAction_Dto = event.data;
      
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

      if (event?.data?.type && !event?.data?.data) {
        const { type, data }: IgnisignBroadcastableAction_Dto = event.data;
        console.error(`${baseMsg}: ${type}`, data, e);

        if(this._iFrameMessagesCallbacks?.handleSignatureSessionError)
          this._iFrameMessagesCallbacks.handleSignatureSessionError(
            IGNISIGN_ERROR_CODES.IGNISIGN_JS_HANDLE_EVENT_ERROR, 
            { type, data, e }, 
            this._signerId,
            this._signatureRequestId);
            
      } else {
        console.error(`${baseMsg}:`, e);
      }
    }
  }

  private _finalizeSignatureRequest(infos: IgnisignBroadcastableAction_SignatureFinalizedDto): void {
    if(!infos?.data?.signatureIds )
      throw new Error(`event data malformed`);

    if(this._iFrameMessagesCallbacks?.handleSignatureSessionFinalized)
      this._iFrameMessagesCallbacks.handleSignatureSessionFinalized(
        infos.data.signatureIds, 
        this._signerId,
        this._signatureRequestId
      );

    if(this._closeOnFinish)
      this._closeIframe();
  }

  private _manageSignatureRequestError(infos: IgnisignBroadcastableAction_SignatureErrorDto): void {
    if(!infos?.data?.errorCode)
      throw new Error(`event data malformed`);

    if(this._iFrameMessagesCallbacks?.handleSignatureSessionError)
      this._iFrameMessagesCallbacks.handleSignatureSessionError(
        infos.data.errorCode, 
        infos?.data?.errorContext, 
        this._signerId,
        this._signatureRequestId
      );

    if(this._closeOnFinish)
      this._closeIframe();
  }

  private async _managePrivateFileInfoProvisioning(infos: IgnisignBroadcastableAction_PrivateFileRequestDto): Promise<IgnisignDocument_PrivateFileDto> {
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