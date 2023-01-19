'use strict'

const Hoek = require('@hapi/hoek')

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
    server.method('getChargingModuleToken', async () => {
      await Hoek.wait(1000) // Simulate some slow I/O

      return Date.now()
    }, {
      cache: {
        expiresIn: 10 * 1000,
        generateTimeout: 2000
      }
    })
  }
}

module.exports = ChargingModuleTokenCachePlugin
