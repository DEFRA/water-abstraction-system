'use strict'

/**
 * Adds the server's cache to the request so we can easily access it from controllers and services.
 *
 * @module CachePlugin
 */

const CachePlugin = {
  name: 'Cache',
  register: (server, _options) => {
    server.ext('onRequest', (request, h) => {
      request.app.cache = server.cache

      return h.continue
    })
  }
}

module.exports = CachePlugin
