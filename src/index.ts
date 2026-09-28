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
  htmlElementId!            : string;
  signatureRequestId!       : string;
  signerId!                 : string;
  signatureSessionToken!    : string;
  signerAuthSecret!         : string;
  sessionCallbacks          : IgnisignJS_SignatureSession_Callbacks = {};
  closeOnFinish            ?: boolean;
  dimensions               ?: IgnisignJS_SignatureSession_Dimensions;
  displayOptions           ?: IgnisignJS_SignatureSession_DisplayOptions;
}

export class IgnisignJs {
  private readonly  _ignisignClientSignUrl : string;
  private _htmlElementId                   : string | null = null;
  private _iFrameId                        : string | null = null;
  private _iFrameMessagesCallbacks         : IgnisignJS_SignatureSession_Callbacks = {};
  private _closeOnFinish                   : boolean = true;
  private _elementResizeObserver           : ResizeObserver | null = null;
  private _iframeResizeObserver            : ResizeObserver | null = null;
  private _signerId                        : string | null = null;
  private _signatureRequestId              : string | null = null;
  private _iFrameOptions                   : IgnisignJS_SignatureSession_Dimensions | null = null;
  private _boundHandleEvent                : ((event: MessageEvent<IgnisignBroadcastableAction_Dto>) => Promise<void>) | null = null;

  constructor(
    protected appId                 : string, 
    protected env                   : IGNISIGN_APPLICATION_ENV, 
              ignisignClientSignUrl : string | null = null
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
        const displayOptionQueries = Object.entries(displayOptions).map(([key, value]) => `${key}=${value}`).join('&');
        const completeUrl = `${this._ignisignClientSignUrl}/signature-requests/${signatureRequestId}/signers/${signerId}/sign?token=${encodeURIComponent(token)}&signerSecret=${encodeURIComponent(signerAuthSecret)}&${displayOptionQueries}`;
        return completeUrl;
      }
      
      this._signerId            = signerId;
      this._signatureRequestId  = signatureRequestId;
      this._closeOnFinish       = closeOnFinish;
      this._iFrameOptions       = dimensions;
      this._htmlElementId       = finalElementId;
      const iframeSrc           = getSignatureSessionLink(signatureRequestId, signerId, signatureSessionToken, displayOptions);
      this._iFrameId            = `${finalElementId}-iframe`;
      
      const htmlElement = document.getElementById(this._htmlElementId);
      
      if(!htmlElement)
        return Promise.reject(`Element with id ${this._htmlElementId} not found`);

      if(htmlElement?.offsetWidth < IFRAME_MIN_WIDTH) 
        return Promise.reject(`Element with id ${finalElementId} is too small. Min width : ${IFRAME_MIN_WIDTH}px`);

      const newIframeElement = document.createElement('iframe');
      newIframeElement.id = this._iFrameId;
      newIframeElement.style.margin = '0 auto';
      newIframeElement.setAttribute('allow', 'publickey-credentials-create allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox allow-top-navigation');
      newIframeElement.src = iframeSrc;
      newIframeElement.title = 'Ignisign';
      
      if(dimensions?.width)
        newIframeElement.width = dimensions.width;
      
      if(dimensions?.height)
        newIframeElement.height = dimensions.height;
      
      htmlElement.innerHTML = '';
      htmlElement.appendChild(newIframeElement);

      this._checkIfIframeIsTooSmall();

      this._iFrameMessagesCallbacks = sessionCallbacks;

      this._elementResizeObserver = new ResizeObserver(this._checkIfIframeIsTooSmall.bind(this));
      this._elementResizeObserver.observe(htmlElement);

      this._iframeResizeObserver = new ResizeObserver(this._checkIfIframeIsTooSmall.bind(this));
      this._iframeResizeObserver.observe(newIframeElement);

      this._boundHandleEvent = this._handleEvent.bind(this);
      window.addEventListener('message', this._boundHandleEvent);

    } catch (e) {
      console.error("[ERROR][IgnisignJS]: Error when initializing signature request");
      return Promise.reject(e);
    }
  }

  public updateSize(iFrameOptions : IgnisignJS_SignatureSession_Dimensions ): void {
    if(!this._iFrameId)
      throw new Error(`[ERROR][IgnisignJS]: No signature request initialized`);

    const foundIframeElement = document.querySelector<HTMLIFrameElement>(`#${this._iFrameId}`);

    if (!foundIframeElement)
      throw new Error(`[ERROR][IgnisignJS]: No signature request initialized`);

    this._iFrameOptions = iFrameOptions;

    if(iFrameOptions?.width)
      foundIframeElement.width = iFrameOptions.width;

    if(iFrameOptions?.height)
      foundIframeElement.height = iFrameOptions.height;
  }

  public cancelSignatureSession(): void {
    this._closeIframe();
  }

  private _closeIframe(): void {
    if(!this._htmlElementId)
      throw new Error(`[ERROR][IgnisignJS]: No signature request initialized`);

    const htmlElementToClean = document.getElementById(this._htmlElementId);
    
    if(htmlElementToClean?.innerHTML) {
      htmlElementToClean.innerHTML = "";
    }
    
    this._htmlElementId           = null;
    this._iFrameId                = null;
    this._signerId                = null;
    this._signatureRequestId      = null;
    
    this._iFrameMessagesCallbacks = {}; 
    
    if (this._boundHandleEvent) {
      window.removeEventListener('message', this._boundHandleEvent);
      this._boundHandleEvent = null;
    }

    if(this._elementResizeObserver) {
      this._elementResizeObserver.disconnect();
      this._elementResizeObserver = null;
    }

    if(this._iframeResizeObserver) {
      this._iframeResizeObserver.disconnect();
      this._iframeResizeObserver = null;
    }
  }


  private async _handleEvent (event: MessageEvent<IgnisignBroadcastableAction_Dto>): Promise<void> {
    try {

      if(!event?.data?.type || !event?.data?.data)
        return;

      const expectedOrigin = new URL(this._ignisignClientSignUrl).origin;
      if(event.origin !== expectedOrigin) {
        console.warn(`[WARNING][IgnisignJS]: Ignoring message from untrusted origin: ${event.origin}`);
        return;
      }

      const { type, data } : IgnisignBroadcastableAction_Dto = event.data;
      
      switch (type) {
        case IGNISIGN_BROADCASTABLE_ACTIONS.NEED_PRIVATE_FILE_URL:
          if(!this._iFrameId)
            throw new Error(`[ERROR][IgnisignJS]: No signature request initialized`);
          
          const dto : IgnisignDocument_PrivateFileDto = await this._managePrivateFileInfoProvisioning({ type, data });

          const iframeElement = document.querySelector<HTMLIFrameElement>(`#${this._iFrameId}`);
  
          if (!iframeElement || !iframeElement.contentWindow)
            throw new Error(`[ERROR][IgnisignJS]: Iframe element with id ${this._iFrameId} not found`);

          iframeElement.contentWindow.postMessage({ ...dto, documentId : data?.documentId }, this._ignisignClientSignUrl); 
          
          break;
        case IGNISIGN_BROADCASTABLE_ACTIONS.OPEN_URL:
          if(!data?.url)
            throw new Error(`event data malformed`);

          try {
            const targetUrl = new URL(data.url);
            const allowedOrigin = new URL(this._ignisignClientSignUrl).origin;
            
            if(targetUrl.origin !== allowedOrigin) {
              console.warn(`[WARNING][IgnisignJS]: Blocked navigation to untrusted URL: ${data.url}`);
              break;
            }
            
            window.open(data.url, '_blank');
          } catch(urlError) {
            console.error(`[ERROR][IgnisignJS]: Invalid URL provided for OPEN_URL action`);
          }
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
        console.error(`${baseMsg}: ${type}`);

        if(this._iFrameMessagesCallbacks?.handleSignatureSessionError && this._signerId && this._signatureRequestId)
          this._iFrameMessagesCallbacks.handleSignatureSessionError(
            IGNISIGN_ERROR_CODES.IGNISIGN_JS_HANDLE_EVENT_ERROR, 
            { type, data, e }, 
            this._signerId,
            this._signatureRequestId);
            
      } else {
        console.error(baseMsg);
      }
    }
  }

  private _finalizeSignatureRequest(infos: IgnisignBroadcastableAction_SignatureFinalizedDto): void {
    if(!infos?.data?.signatureIds )
      throw new Error(`event data malformed`);

    if(!this._signerId || !this._signatureRequestId)
      throw new Error(`[ERROR][IgnisignJS]: Signer ID or Signature Request ID not initialized`);

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

    if(!this._signerId || !this._signatureRequestId)
      throw new Error(`[ERROR][IgnisignJS]: Signer ID or Signature Request ID not initialized`);

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

    if(!this._signerId || !this._signatureRequestId)
      throw new Error(`[ERROR][IgnisignJS]: Signer ID or Signature Request ID not initialized`);

    return this._iFrameMessagesCallbacks.handlePrivateFileInfoProvisioning(
      infos.data.documentId,
      infos.data.externalDocumentId || '',
      this._signerId,
      this._signatureRequestId
    );
  }

  private _checkIfIframeIsTooSmall(): void {
    if(!this._iFrameId)
      return;
      
    const docElement = document.getElementById(this._iFrameId);

    if(!docElement)
      return;

    const height = docElement.offsetHeight;
    const width = docElement.offsetWidth;

    if(!height || !width)
      return;

    if(height < IFRAME_MIN_HEIGHT || width < IFRAME_MIN_WIDTH) {
      const ignisignLoadedEvent = new CustomEvent(IGNISIGN_JS_EVENTS.IFRAME_TOO_SMALL, {
        detail : {
          width                : width,
          height               : height,
          minHeightRecommended : IFRAME_MIN_HEIGHT,
          minWidthRecommended  : IFRAME_MIN_WIDTH
        }
      });
      window.dispatchEvent(ignisignLoadedEvent);
    }
  }

}

(window as any)['IgnisignJs'] = IgnisignJs;
const ignisignLoadedEvent = new CustomEvent(IGNISIGN_JS_EVENTS.IGNISIGN_LOADED);
window.dispatchEvent(ignisignLoadedEvent);