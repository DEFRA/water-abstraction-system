/**
 * Config values used to connect to the ReSP API
 * @module RespConfig
 */

// We import dotenv directly in each config file to support unit tests that depend on this subset of config.
// Importing dotenv in multiple places has no effect on the app when running for real.
import 'dotenv/config'

export default {
  // These values are used as part of requesting a JSON web token from the ReSP APIs Azure AD authentication services.
  // This token is then used to authenticate with the ReSP API itself.
  clientId: process.env.RESP_CLIENT_ID,
  clientSecret: process.env.RESP_CLIENT_SECRET,
  scope: process.env.RESP_SCOPE,
  tenantId: process.env.RESP_TENANT_ID,
  tokenUrl: process.env.RESP_TOKEN_URL,
  url: process.env.RESP_URL
}
