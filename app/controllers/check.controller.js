'use strict'

/**
 * Controller for /check endpoints
 * @module CheckController
 */

const { HTTP_STATUS_NO_CONTENT } = require('node:http2').constants

/**
 * A test end point for checking functionality
 *
 * > This placeholder serves as a reference for when adding your check endpoint
 *
 * @param request - the hapi request object
 * @param h - the hapi response object
 *
 * @returns {Promise<object>} - A promise that resolves to an HTTP response object with a 204 status code
 */
async function placeholder(request, h) {
  const { id } = request.payload

  global.GlobalNotifier.omg('Placeholder endpoint called', { id })

  return h.response().code(HTTP_STATUS_NO_CONTENT)
}

module.exports = {
  placeholder
}
