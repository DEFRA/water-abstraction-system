'use strict'

/**
 * Add an `onPreResponse` listener handle Boom errors and return the appropriate error page
 * @module RequestNotifierPlugin
 */

const { HTTP_STATUS_INTERNAL_SERVER_ERROR, HTTP_STATUS_OK } = require('node:http2').constants

const ErrorPagesService = require('../services/plugins/error-pages.service.js')

const ErrorPagesPlugin = {
  plugin: {
    name: 'error-pages',
    register: (server, _options) => {
      server.ext('onPreResponse', (request, h) => {
        const { stopResponse, statusCode } = ErrorPagesService.go(request)

        if (!stopResponse) {
          return h.continue
        }

        if (statusCode < HTTP_STATUS_INTERNAL_SERVER_ERROR && statusCode !== HTTP_STATUS_OK) {
          return h.view(`${statusCode}`).code(statusCode)
        }

        return h.view('500').code(statusCode)
      })
    }
  }
}

module.exports = ErrorPagesPlugin
