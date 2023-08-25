'use strict'

/**
 * Plugin that handles 'cleaning' payloads of empty or null properties, extraneous whitespace and any malicious content
 * @module RequestNotifierPlugin
 */

const PayloadCleaningService = require('../services/plugins/payload-cleaning.service.js')

const PayloadCleanerPlugin = {
  name: 'payload-cleaner',
  register: (server, _options) => {
    server.ext('onPostAuth', (request, h) => {
      if (!request.payload) {
        return h.continue
      }

      request.payload = PayloadCleaningService.go(request.payload)

      return h.continue
    })
  }
}

module.exports = PayloadCleanerPlugin
