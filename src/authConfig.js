export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AAD_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AAD_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_AAD_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
}

export const loginRequest = {
  scopes: ['User.Read']
}