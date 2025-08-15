'use strict'

/**
 * Adds a server method which a signed JWT access token for GOV.UK Notify.
 *
 * We use hapi's built-in caching to return a token if one exists, or retrieve a new one if it doesn't
 *
 * @module NotifyTokenCachePlugin
 */

const jwt = require('jsonwebtoken')

const servicesConfig = require('../../config/services.config.js')

const FIVE_SECS_IN_MS = 5 * 1000
const TWENTY_FIVE_SECS_IN_MS = 25 * 1000

const NotifyTokenCachePlugin = {
  name: 'NotifyTokenCache',
  register: (server, _options) => {
    // `flags` is passed to our server method automatically by hapi. Overwriting `flags.ttl` in our method lets us
    // override the cache default expiry time
    server.method(
      'getNotifyToken',
      async (flags) => {
        const { secret, serviceId } = _credentials()

        // If the token request was successful it returns an expiry time, so use this to set the cache expiry
        // Otherwise, set the expiry time to 0 to avoid caching the unsuccessful attempt
        flags.ttl = TWENTY_FIVE_SECS_IN_MS

        return jwt.sign(
          {
            iss: serviceId,
            iat: Math.round(Date.now() / 1000)
          },
          secret,
          {
            header: { typ: 'JWT', alg: 'HS256' }
          }
        )
      },
      {
        cache: {
          // Hapi requires us to set an expiry time here but we will always override it via `flags.ttl`
          expiresIn: TWENTY_FIVE_SECS_IN_MS,
          // Hapi requires us to set a timeout value here so we set it to error after 5 seconds
          generateTimeout: FIVE_SECS_IN_MS
        }
      }
    )
  }
}

function _credentials() {
  const { apiKey } = servicesConfig.notify

  return {
    secret: apiKey.substring(apiKey.length - 36, apiKey.length),
    serviceId: apiKey.substring(apiKey.length - 73, apiKey.length - 37)
  }
}

module.exports = NotifyTokenCachePlugin
