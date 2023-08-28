import { IGNISIGN_APPLICATION_ENV, IGNISIGN_BROADCASTABLE_ACTIONS, IGNISIGN_BROADCASTABLE_ACTIONS_TYPE, IgnisignPrivateFileDto } from "@ignisign/public";

const DEFAULT_IGNISIGN_CLIENT_SIGN_URL = 'https://sign.ignisign.io';
const IFRAME_MIN_WIDTH  = 300; 
const IFRAME_MIN_HEIGHT = 500;

console.log('IgnisignJs loaded');

export type Ignisign_InitSignatureRequestCallback = {
  providePrivateFileDto ?: (documentId: string) => Promise<IgnisignPrivateFileDto>;
}

export type Ignisign_IframeOptions = {
  width  ?: string;
  height ?: string;
}
export class IgnisignJs {
  private _appId                 : string;
  private _env                   : IGNISIGN_APPLICATION_ENV;
  private _ignisignClientSignUrl : string;
  private _id                    : string;
  private _iframeId              : string;
  private _callbacks             : Ignisign_InitSignatureRequestCallback = {};

  constructor(appId: string, env: IGNISIGN_APPLICATION_ENV, ignisignClientSignUrl: string = null) {
    this._appId = appId;
    this._env   = env;
    this._ignisignClientSignUrl = ignisignClientSignUrl || DEFAULT_IGNISIGN_CLIENT_SIGN_URL;
  }

  public async initSignatureRequest(
    id                 : string,
    signatureRequestId : string,
    signerId           : string,
    token              : string,
    authSecret         : string,
    callbacks          : Ignisign_InitSignatureRequestCallback = {},
    options            : Ignisign_IframeOptions = {}
  ){
    try {
      if(this._id)
        return Promise.reject(`Signature request already initialized`);

      const getSignatureRequestLink = (signatureRequestId, signerId, token) => 
       `${this._ignisignClientSignUrl}/signature-requests/${signatureRequestId}/signers/${signerId}/sign?token=${token}&signerSecret=${authSecret}`;
      
      this._id        = id;
      const iframeSrc =  getSignatureRequestLink(signatureRequestId, signerId, token);
      this._iframeId  = `${id}-iframe`;

      const iframe    = `
        <iframe style="margin: 0 auto;"
          id="${this._iframeId}"
          allow="publickey-credentials-create allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox allow-top-navigation"
          src="${iframeSrc}"
          title='Ignisign'
          ${options?.width  ? `width="${options.width}"` : ''}
          ${options?.height ? `height="${options.height}"` : ''}
        />
      `;

      // this._iframeHtml = iframe;
      const htmlElement = document.getElementById(id);
      
      if(!htmlElement)
        return Promise.reject(`Element with id ${id} not found`);

      if(htmlElement?.offsetWidth < IFRAME_MIN_WIDTH) 
        return Promise.reject(`Element with id ${id} is too small. Min width : ${IFRAME_MIN_WIDTH}px`);

      document.getElementById(id).innerHTML = iframe;
      
      const iframeElement = document.getElementById(this._iframeId);

      this._checkIfIframeIsTooSmall();

      this._callbacks = callbacks;


      const elementResizeObserver = new ResizeObserver(this._checkIfIframeIsTooSmall.bind(this));
      elementResizeObserver.observe(htmlElement);

      const iframeResizeObserver = new ResizeObserver(this._checkIfIframeIsTooSmall.bind(this));
      iframeResizeObserver.observe(iframeElement);

      window.addEventListener('message', this._handleEvent.bind(this));

    } catch (e) {
      return Promise.reject(e);
    }
  }

  public cancel() {
    if(!this._id)
      return Promise.reject(`No signature request initialized`);

    document.getElementById(this._id).innerHTML = null;
    window.removeEventListener('message', this._handleEvent.bind(this));

    this._ignisignClientSignUrl = null;
    this._id                    = null;
    this._iframeId              = null;
    this._callbacks             = {};
  }

  private async _handleEvent (event: MessageEvent<IGNISIGN_BROADCASTABLE_ACTIONS_TYPE>) {
    console.log('_handleEvent : ', event);
    const {type, data}: IGNISIGN_BROADCASTABLE_ACTIONS_TYPE = event.data;
    
    switch (type) {
      case IGNISIGN_BROADCASTABLE_ACTIONS.NEED_PRIVATE_FILE_URL:
        if(!this._callbacks?.providePrivateFileDto)
          throw new Error(`Callback providePrivateFileDto not set`); 
        
        const dto : IgnisignPrivateFileDto = await this._callbacks.providePrivateFileDto(data?.documentId);
        const iframeElement = document.querySelector<HTMLIFrameElement>(`#${this._iframeId}`);

        if (iframeElement) {
          iframeElement.contentWindow.postMessage({ ...dto, documentId : data?.documentId }, "*"); 
        } else {
          throw new Error(`Iframe element with id ${this._iframeId} not found`);
        }
        break;
      case IGNISIGN_BROADCASTABLE_ACTIONS.OPEN_URL:
        window.open(data?.url, '_blank');
        break;
        
      default:
        console.warn(`${event.type}-${type}: NIY`);
        break;
    }
  }
  
  private _checkIfIframeIsTooSmall() {
    const docElement = document.getElementById(this._iframeId);

    if(docElement?.offsetHeight < IFRAME_MIN_HEIGHT || docElement?.offsetWidth < IFRAME_MIN_WIDTH) {
      this.cancel();
      throw new Error(`Iframe is too small. Min width : ${IFRAME_MIN_WIDTH}px, min height : ${IFRAME_MIN_HEIGHT}px`);
    }

    // TODO => See if we need to display a message if the iframe is too small

    // const sizeTooSmall = docElement?.offsetHeight < IFRAME_MIN_HEIGHT || docElement?.offsetWidth < IFRAME_MIN_WIDTH;

    // if(sizeTooSmall && !this._iframeTooSmall) {
    //   this._iframeTooSmall = true;
    //   document.getElementById(this._id).innerHTML = `
    //     <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; width: 100%;">
    //       <div style="font-weight: bold;;"> The element is too small to display the signature request </div>
    //     </div>
    //   `;
      

      
    // } else if(!sizeTooSmall && this._iframeTooSmall) {
    //   document.getElementById(this._id).innerHTML = this._iframeHtml;
    //   this._iframeTooSmall = false;
    // } else {
    //   this._iframeTooSmall = false;
    // }
  }

}

console.log('IgnisignJs loaded');