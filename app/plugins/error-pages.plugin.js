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

        // If we're not stopping the response, but the status code is 200, it's because there has been a 500 internal
        // server error. We can't return a status code of 500 because the AWS WAF will block the response, which is why
        // we return a 200 status with our custom 500 error page.
        if (statusCode === HTTP_STATUS_OK) {
          return h.view('500').code(statusCode)
        }

        // Else return the status code and the customer error page for it (currently 404 and 410)
        return h.view(`${statusCode}`).code(statusCode)
      })
    }
  }
}

module.exports = ErrorPagesPlugin
