// Central API base URL.
// In production, calls go through the Static Web App /api proxy (see staticwebapp.config.json)
// which rewrites to the Function App — keeping the backend URL out of the JS bundle.
// In local dev, calls go directly to the Azure Functions local runtime.
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:7071/api'
  : '/api'

export default API_BASE
