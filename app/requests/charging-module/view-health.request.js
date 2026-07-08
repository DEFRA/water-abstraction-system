/**
 * View the health of Charging Module service
 * @module ViewHealthRequest
 */

import { getRequest } from '../charging-module.request.js'

/**
 * View the health of Charging Module service
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
export async function send() {
  const path = 'status'

  return getRequest(path)
}
