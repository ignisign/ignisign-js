


## Integrating Ignisign Signature in Web Applications

This library facilitates the integration of the Ignisign electronic signature into web-based applications using the `embedded` mode. 

Alternatively, Ignisign can be integrated in a `by side` mode, where users are redirected to the Ignisign platform to sign documents via an email link, with Ignisign managing the entire process.

For detailed information on these integration modes, visit [Web Integration](https://ignisign.io/docs/quick-start/signature-interface/Web_Integration).

If you are looking for the NodeJS Backend library, it is available [here](https://github.com/ignisign/ignisign-node).

## Installation

Install the library using npm:

```bash
npm install @ignisign/js
```

The package name is `@ignisign/js`. There is no `@ignisign/ignisign-js` package and no hosted script: install it from npm and bundle it with your application.

An Ignisign account is required, which can be created for free at [Ignisign Sign Up](https://console.ignisign.io/signup).

## Examples

Find integration examples [here](https://github.com/ignisign/ignisign-examples/tree/main/ignisign-js).

## Usage

### Initializing IgnisignJs Class

To use IgnisignJs, first initialize the class. You will need an `appId` and an `application environment`:

```typescript
import { IgnisignJs } from "@ignisign/js"

const ignisignJs = new IgnisignJs(appId, appEnv);
```

Find your `appId` and `appEnv` in the "API Keys" section of the [Ignisign Console](https://console.ignisign.io/). The `application environment` is defined as:

```typescript
enum IGNISIGN_APPLICATION_ENV {
  DEVELOPMENT = "DEVELOPMENT",
  STAGING = "STAGING",
  PRODUCTION = "PRODUCTION",
}
```

`IGNISIGN_APPLICATION_ENV` is exported by `@ignisign/public`, a dependency of this package. Add it to your own dependencies if your package manager does not hoist it.

The signing page is loaded from `https://sign.ignisign.io` in every environment. `DEVELOPMENT`, `STAGING` and `PRODUCTION` do not use a different hostname: the environment is the one of the API key that created the signature request.

### Initializing a Signature Session

To start a signature session, use the `initSignatureSession` method of your `ignisignJs` instance:

#### Error Handling

Implement `handleSignatureSessionError` to manage errors:

```typescript
const handleSignatureSessionError = async (
    errorCode, errorContext, signerId, signatureRequestId
  ) : Promise<void> => {
    // Error handling logic here
  }
```

`handleSignatureSessionError` Params
- `errorCode`: The error code
- `errorContext`: A context that will help you to understand from where the error comes from
- `signerId` : The id of the signer
- `signatureRequestId` : The id of the signature request



#### Finalizing Signatures

For handling the completion of signatures, use `handleSignatureSessionFinalized`:

```typescript
const handleSignatureSessionFinalized = async (
    signatureIds, signerId, signatureRequestId
  ) : Promise<void> => {
    // Finalization logic here
  }
```

`handleSignatureSessionFinalized` params

- `signatureIds` : The ids of the signatures 
- `signerId` : The id of the signer
- `signatureRequestId`: The id of the signature request

When the documents of a signature request are signed one by one (the default for signature requests with several documents, see [Documents signed one by one](https://ignisign.io/docs/sdks/changelogs/per-document-signing)), `handleSignatureSessionFinalized` is called once the signer is done: after their last document, or when they choose **Finish**, which cancels the documents they did not sign. It is not called after each document. With `closeOnFinish` (default `true`), the iframe closes at that point.

#### Managing Private File Information

For private file info provisioning, implement `handlePrivateFileInfoProvisioning`:

```typescript
const handlePrivateFileInfoProvisioning = async (
    documentId, externalDocumentId, signerId, signatureRequestId
  ): Promise<IgnisignDocument_PrivateFileDto> => {
    // Logic to retrieve private file information
  }
```

`handlePrivateFileInfoProvisioning` params

- `documentId` : The id of the document to sign
- `externalDocumentId` : An reference that refers to the document to sign into your application - You have to provide it when you provide the document to Ignisign
- `signerId` : The id of the signer
- `signatureRequestId` : The id of the signature request

`IgnisignPrivateFileDto` fields

- `fileUrl`   : The url of the file to sign
- `mimeType`  : The mime type of the file to sign
- `fileName`  : The name of the file to sign
- `bearer`    : Optional - A bearer token to access the file -  if provided, the bearer token will be placed into the Authorization header of the request


### Signature Session Initialization Parameters

Define the initialization parameters for the signature session:

```typescript
const initParams: IgnisignJS_SignatureSession_Initialization_Params = {
  htmlElementId          : "my-div-signature-request-request-id",
  signatureRequestId     : "6490205421ac2fXXXXX" ,
  signerId               : "6490205421ac2fXXXXX",
  signatureSessionToken  : "6490205421ac2fXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  signerAuthSecret       : "6490205421ac2fXXXXX" , 
  closeOnFinish          : true,
  sessionCallbacks : {
    handleSignatureSessionError,
    handleSignatureSessionFinalized,
    handlePrivateFileInfoProvisioning,
  },
  dimensions : {
    width: "100%",
    height: "500px",
  },
  displayOptions : {
    showTitle                     : false,
    showDescription               : false,
    darkMode                      : false,
    forceShowDocumentInformations : false
  }
}

await ignisignJs.initSignatureSession(initParams);
```


`IgnisignJS_SignatureSession_Initialization_Params` fields

- `htmlElementId` :  The id of the html element that will contain the signature request iframe. The element must be at least 200px wide; the iframe warns below 400px of height
- `signatureRequestId` : The id of the signature request - returned when you create the signature request, and sent to your backend by webhook
- `signerId` :  The id of the signer - returned when you create the signer, and sent to your backend by webhook
- `signatureSessionToken` : The unique token that allows you to access to the signature request for the signer - returned by the publish call (`signersEmbedded[].token`), and sent to your backend by the signature request webhook
- `signerAuthSecret` : The secret that allows you to authenticate the signer - returned by the signer creation call (`authSecret`). Store it: it is not sent by webhook
- `closeOnFinish` : OPTIONAL - default true - If true, the signature request iframe will be closed automatically in case of finalization or error 
- `sessionCallbacks` :  OPTIONAL The callbacks that will be called when the signature request iframe send a message to the parent window
- `sessionCallbacks.handlePrivateFileInfoProvisioning` :OPTIONAL -  This method must be implemented if the signature profile linked to the signature request is configured to use a private files. If you want to close automatically the signature request iframe when the signature request is finalized, you can set the closeOnFinish parameter to true when you call the initSignatureSession method
- `sessionCallbacks.handleSignatureSessionError` : RECOMMENDED - This method must be implemented if you want to handle the signature request errors.
- `sessionCallbacks.handleSignatureSessionFinalized` : RECOMMENDED -  This method must be implemented if you want to handle the signature request finalization.
- `dimensions` : OPTIONAL - The options that will be used to configure the signature request iframe
- `dimensions.width` : default: "100%"
- `dimensions.height` : default  "500px"
- `displayOptions` : OPTIONAL - Option that determinate the content displayed into the signing interface
- `displayOptions.showTitle` : default: false - Show the title of the signature request like in by-side mode
- `displayOptions.showDescription` : default: false - Show the description of the signature request like in by-side mode
- `displayOptions.darkMode` : default : "Browser" force the darkMode of the content.
- `displayOptions.forceShowDocumentInformations` : default : false 


## Canceling a Signature Session

To prematurely close a signature session, call `cancelSignatureSession` on your `ignisignJs` instance:

```typescript
ignisignJs.cancelSignatureSession();
```
