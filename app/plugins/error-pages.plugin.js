'use strict'

/**
 * Add an `onPreResponse` listener handle Boom errors and return the appropriate error page
 * @module RequestNotifierPlugin
 */

const { HTTP_STATUS_NOT_FOUND } = require('node:http2').constants

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

        if (statusCode === HTTP_STATUS_NOT_FOUND) {
          return h.view('404').code(statusCode)
        }

        return h.view('500').code(statusCode)
      })
    }
  }
}

module.exports = ErrorPagesPlugin
