# Ignisign JS

This is the library that can be used to integrate the Ignisign signature into your application.

This integration mode is called `embedded` mode. 

You can also integrate Ignisign with an `by side` mode. 

In this mode, the user is redirected to the Ignisign application to sign the document directly by receiving a link from ignisign by email, and all the process is managed by Ignisign. 

More information about these two modes can be found [here](https://doc.ignisign.io/#tag/Embeded-or-By-Side-Integration).

If you are looking for the NodeJS Backend library, it is available [here](https://github.com/ignisign/ignisign-node) 

## Installation

You can install the library using npm.

```bash
npm install @ignisign/ignisign-js
```

It's also possibile to integrate the library using a script tag in a standalone means

```html
<script src="https://ignisign.io/assets/ignisign-js.min.js"></script>
```

You also need an Ignisign account. You can create one [here](https://console.ignisign.io/signup). Do not hesitate it's Free ! :)


## Examples

2 integrations examples are available to show how the interaction with can be used.

You can find these examples [here](https://github.com/ignisign/ignisign-js/tree/main/examples/npm-based) and [here](https://github.com/ignisign/ignisign-js/tree/main/examples/standalone)

## Usage

### Initiate the IgnisignJs class.

First at all you need to initiate the IgnisignJs class
You will need an `appId` and an `application environment` 


```typescript
import { IgnisignJs } from "@ignisign/ignisign-js"

const ignisignJs = new IgnisignJs(appId, appEnv);
```
You can found your appId in the API Keys section of your application into the [Ignisign Console](https://console.ignisign.io/). 

The `application environment` is a value of the following enum:
```typescript
enum IGNISIGN_APPLICATION_ENV {
  DEVELOPMENT   = "DEVELOPMENT",
  STAGING       = "STAGING",
  PRODUCTION    = "PRODUCTION",
}
```

# Initialize a signature request.

To initialize a signature request, you need to call the `initSignatureRequest` method of the `ignisignJs` object you created before.


```typescript
import { IgnisignJs, IgnisignJS_SignatureRequest_Initialization_Params, IgnisignPrivateFileDto } from "@ignisign/ignisign-js"

// RECOMMENDED
// This method must be implemented if you want to handle the signature request errors
const handleSignatureRequestError = async (
    errorCode: IGNISIGN_ERROR_CODES, // The error code
    errorContext: any, //a context that will help you to understand from where the error comes from
    signerId: string, // The id of the signer
    signatureRequestId: string // The id of the signature request
  ) : Promise<void> {
    // Here you can handle the error
  }

// RECOMMENDED
// This method must be implemented if you want to handle the signature request finalization
// If you want to close automatically the signature request iframe when the signature request is finalized, you can set the closeOnFinish parameter to true when you call the initSignatureRequest method
const handleSignatureRequestFinalized = async (
  signatureIds: string[], // The ids of the signatures 
    signerId: string, // The id of the signer
    signatureRequestId: string // The id of the signature request
  ) : Promise<void> {
    // Here you can handle the signature request finalization
  }

// OPTIONAL 
//This method must be implemented if the signature profile linked to the signature request is configured to use a private files.


const handlePrivateFileInfoProvisioning = async (
    
    documentId          : string,   // The id of the document to sign
    externalDocumentId  : string,  // An reference that refers to the document to sign into your application - You have to provide it when you provide the document to Ignisign
    signerId            : string,  // The id of the signer
    signatureRequestId  : string   // The id of the signature request
  ): Promise<IgnisignPrivateFileDto> => {
    // Here you can call your backend to get the private file information

    const privateFileDto : IgnisignPrivateFileDto = {
      // The url of the file to sign
      fileUrl: "https://my-file-url.com/a-file.pdf", 
      // The mime type of the file to sign
      mimeType: "application/pdf",
      // The name of the file to sign
      fileName: "A-very-important-file.pdf",
      // A bearer token to access the file
      // Optionnal
      // if provided, the bearer token will be placed into the Authorization header of the request
      bearer : "XXX..."
    }

    return privateFileDto
}


const initParams: IgnisignJS_SignatureRequest_Initialization_Params = {
  htmlElementId       : "my-div-signature-request-request-id", // the id of the html element that will contain the signature request iframe
  signatureRequestId  : "6490205421ac2f001cace77e" , // The id of the signature request - this value is provided to your backend by webhook when the signature request is created
  signerId            : "6490205421ac0f001cace47e", // The id of the signer - this value is provided to your backend by webhook when the signature request is created
  token               : "6490205421ac2f001cace77e6490205421ac2f001cace77e6490205421ac2f001cace77e", // The unique token that allows you to access to the signature request for the signer - This value is provided to your backend by webhook when the signature request is created
  signerAuthSecret    : "6490205421ac0f001cace47e" , // The secret that allows you to authenticate the signer - This value is provided to your backend by webhook when the signer is created
  closeOnFinish       : true, // If true, the signature request iframe will be closed automatically in case of finalization or error 
  iFrameMessagesCallbacks : { // The callbacks that will be called when the signature request iframe send a message to the parent window
    handleSignatureRequestError,
    handleSignatureRequestFinalized,
    handlePrivateFileInfoProvisioning,
  }
  iFrameOptions : { // The options that will be used to configure the signature request iframe
    width: "100%",
    height: "500px",
  }

}

```

**Additional Documentation** that will help you to implement IgnisignJs integration : 
- **Private files** Documentation : [https://doc.ignisign.io/#tag/Private-Files](https://doc.ignisign.io/#tag/Private-Files)
- Explaination of the **Signature Profile** Principle : [https://doc.ignisign.io/#tag/Signature-Profiles](https://doc.ignisign.io/#tag/Signature-Profiles)
- **Webhook** Documentation : [https://doc.ignisign.io/#tag/Webhooks](https://doc.ignisign.io/#tag/Webhooks)












