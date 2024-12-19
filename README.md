


## Integrating Ignisign Signature in Web Applications

This library facilitates the integration of the Ignisign electronic signature into web-based applications using the `embedded` mode. 

Alternatively, Ignisign can be integrated in a `by side` mode, where users are redirected to the Ignisign platform to sign documents via an email link, with Ignisign managing the entire process.

For detailed information on these integration modes, visit Embedded or By-Side Integration].

If you are looking for the NodeJS Backend library, it is available [here](https://github.com/ignisign/ignisign-node).

## Installation

Install the library using npm:

```bash
npm install @ignisign/ignisign-js
```

An Ignisign account is required, which can be created for free at [Ignisign Sign Up](https://console.ignisign.io/signup).

## Examples

Find integration examples [here](https://github.com/ignisign/ignisign-examples/tree/main/ignisign-js).

## Usage

### Initializing IgnisignJs Class

To use IgnisignJs, first initialize the class. You will need an `appId` and an `application environment`:

```typescript
import { IgnisignJs } from "@ignisign/ignisign-js"

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
- `signatureRequestId`: The id of the signature requ

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
    handleSignatureRequestError,
    handleSignatureRequestFinalized,
    handlePrivateFileInfoProvisioning,
  }
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


IgnisignJS_SignatureRequest_Initialization_Params fields informations

- `htmlElementId` :  The id of the html element that will contain the signature request iframe
- `signatureRequestId` : The id of the signature request - this value is provided to your backend by webhook when the signature request is created
- `signerId` :  The id of the signer - this value is provided to your backend by webhook when the signature request is created
- `signatureSessionToken` : The unique token that allows you to access to the signature request for the signer - This value is provided to your backend by webhook when the signature request is created
- `signerAuthSecret` : The secret that allows you to authenticate the signer - This value is provided to your backend by webhook when the signer is created
- `closeOnFinish` : OPTIONAL - default true - If true, the signature request iframe will be closed automatically in case of finalization or error 
- `sessionCallbacks` :  OPTIONAL The callbacks that will be called when the signature request iframe send a message to the parent window
- `sessionCallbacks.handlePrivateFileInfoProvisioning` :OPTIONAL -  This method must be implemented if the signature profile linked to the signature request is configured to use a private files. If you want to close automatically the signature request iframe when the signature request is finalized, you can set the closeOnFinish parameter to true when you call the initSignatureRequest method
- `sessionCallbacks.handleSignatureRequestError` : RECOMMENDED - This method must be implemented if you want to handle the signature request errors.
- `sessionCallbacks.handleSignatureRequestFinalized` : RECOMMENDED -  This method must be implemented if you want to handle the signature request finalization.
- `dimensions` : OPTIONAL - The options that will be used to configure the signature request iframe
- `dimensions.width` : default: "100%"
- `dimensions.height` : default  "500px"
- `displayOptions` : OPTIONAL - Option taht determinate the content displayed into the signing interface
- `displayOptions.showTitle` : default: false - Show the title of the signature request like in by-side mode
- `displayOptions.showDescription` : default: false - Show the description of the signature request like in by-side mode
- `displayOptions.darkMode` : default : "Browser" force the darkMode of the content.
- `displayOptions.forceShowDocumentInformations` : default : false 


## Canceling a Signature Session

To prematurely close a signature session, call `cancelSignatureSession` on your `ignisignJs` instance:

```typescript
ignisignJs.cancelSignatureSession();
```
