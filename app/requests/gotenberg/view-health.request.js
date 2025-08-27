'use strict'

/**
 * View the health of Gotenberg service
 * @module ViewHealthRequest
 */

const GotenbergRequest = require('../gotenberg.request.js')

/**
 * View the health of Gotenberg service
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send() {
  const path = 'health'

  return GotenbergRequest.get(path)
}

module.exports = {
  send
}
