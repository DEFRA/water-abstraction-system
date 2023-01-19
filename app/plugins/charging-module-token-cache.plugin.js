'use strict'

const ChargingModuleTokenService = require('../services/charging-module/token.service')

/**
 * Adds a server method which returns a Cognito token for the Charging Module.
 *
 * We use hapi's built-in caching to return a token if one exists, or retrieve a new one if it doesn't
 *
 * @module ChargingModuleTokenCachePlugin
 */

const ChargingModuleTokenCachePlugin = {
  name: 'ChargingModuleTokenCache',
  register: (server, _options) => {
    // `flags` is passed to our server method automatically by hapi. We use it to set the ttl on a per-request basis
    server.method('getChargingModuleToken', async (flags) => {
      const token = await ChargingModuleTokenService.go()

      // If the response has an expiry time then use this to set the cache expiry
      // Otherwise, set the expiry time to 0 to avoid caching the unsuccessful attempt
      flags.ttl = token.expiresIn ? _setExpiryTime(token.expiresIn) : 0

      return token
    }, {
      cache: {
        // We need to set an expiry time here but we will always override it
        expiresIn: 5000,
        generateTimeout: 2000
      }
    })
  }
}

function _setExpiryTime (expiresIn) {
  // The expiry time comes to us in seconds so we need to convert it to milliseconds. We also set it to expire 1 minute
  // before the reported expiry time, to avoid cases where the token is retrieved from the cache but expires before the
  // request can be made
  return (expiresIn - 60) * 1000
}

module.exports = ChargingModuleTokenCachePlugin
