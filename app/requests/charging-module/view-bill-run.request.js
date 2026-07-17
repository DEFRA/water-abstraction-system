/**
 * Connects with the Charging Module to getRequest a bill run summary
 * @module ChargingModuleViewBillRunRequest
 */

import { getRequest } from '../../requests/charging-module.request.js'

/**
 * View a bill run in the Charging Module API
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/ViewBillRun | CHA API docs} for more
 * details
 *
 * @param {string} billRunId - UUID of the charging module API bill run to view
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
export default async function viewBillRunRequest(billRunId) {
  const path = `v3/wrls/bill-runs/${billRunId}`
  const result = await getRequest(path)

  return result
}
