'use strict'

/**
 * View the health of the ReSP API service
 * @module ViewHealthRequest
 */

const RespRequest = require('../resp.request.js')

/**
 * View the health of the ReSP API service
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send() {
  const path = 'rsp/v1/monitoringFrequency'

  return RespRequest.get(path)
}

module.exports = {
  send
}
