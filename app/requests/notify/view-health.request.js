/**
 * View the health of Notify service
 * @module ViewHealthRequest
 */

import { getRequest } from '../notify.request.js'

/**
 * View the health of Notify service
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
export default async function viewHealthRequest() {
  return getRequest('')
}
