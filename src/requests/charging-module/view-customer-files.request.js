/**
 * Connects with the Charging Module to getRequest customer files exported in the last `x` days
 * @module ChargingModuleViewBillRunRequest
 */

import { getRequest } from '../../requests/charging-module.request.js'

/**
 * Connects with the Charging Module to getRequest customer files exported in the last `x` days
 *
 * See
 * {@link https://defra.github.io/sroc-charging-module-api-docs/#/customer/ListCustomerFiles | CHA API docs}
 * for more details
 *
 * @param {number} days - The numbers of days to look back for exported customer files: 0 means today; 1 means today and
 * yesterday; 2 means today, yesterday and the day before, etc.
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
export default async function viewCustomerFilesRequest(days) {
  const path = `v3/wrls/customer-files/${days}`
  const result = await getRequest(path)

  return result
}
