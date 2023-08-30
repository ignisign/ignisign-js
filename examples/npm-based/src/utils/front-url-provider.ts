export const  FrontUrlProvider = {
  homePage                       : () => "/",
  usersPage                      : () => "/users",
  signatureRequestsPage          : () => '/signature-requests',
  signatureRequestCreationPage   : () => '/signature-request-creation',
  signatureRequestsDetailPage    : (signatureRequestId = null) => `/signature-request/${signatureRequestId || ':signatureRequestId'}`,
}
