/**
 * View the health of the ReSP API service
 * @module ViewHealthRequest
 */

import RespRequest from '../resp.request.js'

/**
 * View the health of the ReSP API service
 *
 * The ReSP API does not have a status or health endpoint that we can ping. So, we’ve chosen an endpoint that we know
 * returns a small payload to minimise any load or processing time.
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send() {
  const path = 'rsp/v1/monitoringFrequency'

  return RespRequest.get(path)
}

export {
  send
}
export default {
  send
}
