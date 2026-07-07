/**
 * View the health of a Legacy service
 * @module ViewHealthRequest
 */

import LegacyRequest from '../legacy.request.js'

/**
 * View the health of a Legacy service
 *
 * @param {string} serviceName - Name of the legacy service to call (background, crm, external, idm, import, internal,
 * permits, reporting, returns or water)
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(serviceName) {
  return LegacyRequest.get(serviceName, 'health/info', null, false)
}

export {
  send
}
export default {
  send
}
