'use strict'

/**
 * View the health of Notify service
 * @module ViewHealthRequest
 */

const NotifyRequest = require('../notify.request.js')

/**
 * View the health of Notify service
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send() {
  return NotifyRequest.get('')
}

module.exports = {
  send
}
