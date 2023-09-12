import { IGNISIGN_ERROR_CODES } from "@ignisign/public/dist/_commons/ignisign-errors.public";
import { IgnisignDocument_PrivateFileDto } from "@ignisign/public/dist/documents/document-content.public";
import { IGNISIGN_APPLICATION_ENV } from "@ignisign/public/dist/applications/applications.public";
export declare enum IGNISIGN_JS_EVENTS {
    IGNISIGN_LOADED = "IGNISIGN_LOADED",
    IFRAME_TOO_SMALL = "IFRAME_TOO_SMALL"
}
export type Ignisign_InitSignatureRequestCallback = {
    handlePrivateFileInfoProvisioning?: (documentId: string, externalDocumentId: string, signerId: string, signatureRequestId: string) => Promise<IgnisignDocument_PrivateFileDto>;
    handleSignatureRequestError?: (errorCode: IGNISIGN_ERROR_CODES, errorContext: any, signerId: string, signatureRequestId: string) => Promise<void>;
    handleSignatureRequestFinalized?: (signatureIds: string[], signerId: string, signatureRequestId: string) => Promise<void>;
};
export type Ignisign_iFrameOptions = {
    width?: string;
    height?: string;
};
export declare class IgnisignJS_SignatureRequest_Initialization_Params {
    htmlElementId: string;
    signatureRequestId: string;
    signerId: string;
    token: string;
    signerAuthSecret: string;
    closeOnFinish: boolean;
    iFrameMessagesCallbacks: Ignisign_InitSignatureRequestCallback;
    iFrameOptions: Ignisign_iFrameOptions;
}
export declare class IgnisignJs {
    protected appId: string;
    protected env: IGNISIGN_APPLICATION_ENV;
    private readonly _ignisignClientSignUrl;
    private _htmlElementId;
    private _iFrameId;
    private _iFrameMessagesCallbacks;
    private _closeOnFinish;
    private _elementResizeObserver;
    private _iframeResizeObserver;
    private _signerId;
    private _signatureRequestId;
    constructor(appId: string, env: IGNISIGN_APPLICATION_ENV, ignisignClientSignUrl?: string);
    initSignatureRequest(initParams: IgnisignJS_SignatureRequest_Initialization_Params): Promise<void>;
    cancelSignatureRequest(): void;
    private _closeIframe;
    private _finalizeSignatureRequest;
    private _manageSignatureRequestError;
    private _managePrivateFileInfoProvisioning;
    private _handleEvent;
    private _checkIfIframeIsTooSmall;
}
