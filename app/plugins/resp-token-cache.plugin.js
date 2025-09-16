'use strict'

const RespTokenRequest = require('../requests/resp/token.request.js')

/**
 * Adds a server method which returns a Azure AD token for the ReSP API.
 *
 * We use hapi's built-in caching to return a token if one exists, or retrieve a new one if it doesn't
 *
 * @module RespTokenCachePlugin
 */

const ONE_HOUR_IN_MS = 60 * 60 * 1000
const ONE_MINUTE_IN_MS = 60 * 1000

const RespTokenCachePlugin = {
  name: 'RespTokenCache',
  register: (server, _options) => {
    // `flags` is passed to our server method automatically by hapi. Overwriting `flags.ttl` in our method lets us
    // override the cache default expiry time
    server.method(
      'getRespToken',
      async (flags) => {
        const token = await RespTokenRequest.send()

        // If the token request was successful it returns an expiry time, so use this to set the cache expiry
        // Otherwise, set the expiry time to 0 to avoid caching the unsuccessful attempt
        flags.ttl = token.expiresIn ? _setExpiryTime(token.expiresIn) : 0

        return token
      },
      {
        cache: {
          // Hapi requires us to set an expiry time here but we will always override it via `flags.ttl`
          expiresIn: ONE_HOUR_IN_MS,
          // Hapi requires us to set a timeout value here so we set it to error after one minute. In practice we would
          // expect RespTokenRequest to have returned an unsuccessful response which we would gracefully handle
          generateTimeout: ONE_MINUTE_IN_MS
        }
      }
    )
  }
}

function _setExpiryTime(expiresIn) {
  // The expiry time comes to us in seconds so we need to convert it to milliseconds. We also set it to expire 1 minute
  // before the reported expiry time, to avoid cases where the token is retrieved from the cache but expires before the
  // request can be made
  return (expiresIn - 60) * 1000
}

module.exports = RespTokenCachePlugin
