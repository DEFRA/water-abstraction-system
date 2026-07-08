/**
 * Connects with the Charging Module to view a bill
 * @module ViewBillService
 */

import { getRequest } from '../charging-module.request.js'

/**
 * Sends a request to the Charging Module to view an invoice and returns the result
 *
 * See {@link https://defra.github.io/sroc-charging-module-api-docs/#/bill-run/ViewBillRunInvoice | API docs} for more
 * details
 *
 * @param {string} billRunId - UUID of the Charging Module API bill run the bill is on
 * @param {string} billId - UUID of the Charging Module bill to view
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
export async function send(billRunId, billId) {
  const path = `v3/wrls/bill-runs/${billRunId}/invoices/${billId}`

  return getRequest(path)
}
