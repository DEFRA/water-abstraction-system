'use strict'

/**
 * Orchestrates the sending of a bill run
 * @module SubmitSendBillRunService
 */

const SendBillBunService = require('./send-bill-run.service.js')
const UpdateInvoiceNumbersService = require('./update-invoice-numbers.service.js')

/**
 * Orchestrates the sending of a bill run
 *
 * It first calls `SendBillBunService` which will determine if the bill run _can_ be sent. If it can, it will update the
 * status of the bill run to 'sending'.
 *
 * It returns the fetched instance of the bill run, with the status set to 'sending' if the bill run was sent.
 *
 * It then calls `UpdateInvoiceNumbersService` which will update the bill run and all its bill records with the invoice
 * numbers generated by the Charging Module API, after first sending it an 'approve' then 'send' request.
 *
 * We specifically do not await the `UpdateInvoiceNumbersService` call here as we do not want to block the request. This
 * is because it can take more than a second to complete the update of the invoice numbers.
 *
 * @param {string} billRunId - UUID of the bill run to be sent
 */
async function go(billRunId) {
  const billRun = await SendBillBunService.go(billRunId)

  if (billRun.status === 'sending') {
    UpdateInvoiceNumbersService.go(billRun)
  }
}

module.exports = {
  go
}
