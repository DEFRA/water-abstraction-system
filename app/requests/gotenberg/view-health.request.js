/**
 * View the health of Gotenberg service
 * @module ViewHealthRequest
 */

import { getRequest } from '../base.request.js'
import gotenbergConfig from '../../../config/gotenberg.config.js'

/**
 * View the health of Gotenberg service
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
export default async function viewHealthRequest() {
  const statusUrl = new URL('/health', gotenbergConfig.url)

  return getRequest(statusUrl.href, { responseType: 'json' })
}
