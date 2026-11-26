# Changelog

## 4.2.1 — 2026-11-03

- The signer iframe is now created with `allow="publickey-credentials-get; publickey-credentials-create"`. The previous value mixed `sandbox` tokens into the Permissions-Policy `allow` attribute (`publickey-credentials-create allow-scripts allow-same-origin …`); browsers drop the invalid tokens, which left `publickey-credentials-create` with an empty allowlist and never granted `publickey-credentials-get`. Passkey authentication and extended sessions run WebAuthn inside the iframe and need that permission in a cross-origin frame. Measured in Chromium: with the old value a cross-origin iframe reports `allowsFeature('publickey-credentials-get') === false` and `allowsFeature('publickey-credentials-create') === false`, the same as with no `allow` attribute at all; with the new value both are `true`. No API change.
- README: the package is `@ignisign/js` (there is no `@ignisign/ignisign-js`), the session callbacks are `handleSignatureSessionError` / `handleSignatureSessionFinalized`, the signing page is `https://sign.ignisign.io` in every environment.

## 4.2.0 — 2025-04-18

- Baseline of this changelog.
