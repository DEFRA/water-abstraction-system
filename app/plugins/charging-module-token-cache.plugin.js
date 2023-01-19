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
  name: 'Cache',
  register: (server, _options) => {
    // `flags` is passed in automatically by hapi. We use it to set the ttl on a per-request basis
    server.method('getChargingModuleToken', async (flags) => {
      const token = await ChargingModuleTokenService.go()

      // Manually set the ttl to 10 seconds
      flags.ttl = 10 * 1000

      return token
    }, {
      cache: {
        // Hapi requires an `expiresIn` time but we will always override it so we set the default to 1 day
        expiresIn: 24 * 60 * 60 * 1000,
        generateTimeout: 2000
      }
    })
  }
}

module.exports = ChargingModuleTokenCachePlugin
