export type MySignatureRequest = {
  _id                 ?: string;
  title               ?: string;
  signatureProfileId  ?: string;
}

export type MySignatureRequestSigners = {
  _id                 ?: string;
  signatureRequestId  ?: string;
  signers ?: {
    signerId ?: string;
    myUserId ?: string;
    token    ?: string;
  }[]
}

export type Signer = {
  _id         ?: string;
  firstName    : string;
  lastName     : string;
  authSecret  ?: string;
  token       ?: string;
  signerId    ?: string;
}