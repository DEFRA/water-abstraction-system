'use strict'

/**
 * Updates a bill run and its bill records with the invoice numbers generated by the Charging Module API
 * @module UpdateInvoiceNumbersService
 */

const BillModel = require('../../../models/bill.model.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const ExpandedError = require('../../../errors/expanded.error.js')
const { calculateAndLogTimeTaken, timestampForPostgres } = require('../../../lib/general.lib.js')
const ChargingModuleSendBillRunRequest = require('../../../requests/charging-module/send-bill-run.request.js')
const ChargingModuleViewBillRunRequest = require('../../../requests/charging-module/view-bill-run.request.js')
const UnflagBilledSupplementaryLicencesService = require('../unflag-billed-supplementary-licences.service.js')

/**
 * Updates a bill run and its bill records with the invoice numbers generated by the Charging Module API
 *
 * We first send a request to the Charging Module API to send the bill run there. Then we fetch an updated copy of the
 * Charging Module API invoice data, and apply the invoice numbers its generated to the bills in the bill run.
 *
 * Once complete we then update the status of the bill run to `sent`.
 *
 * It can take the CHA more than a second to complete the send process for larger bill runs. This is why we hand back
 * control to the UI early so we don't block the user or cause a timeout.
 *
 * @param {module:BillRunModule} billRun - The bill run to be sent
 */
async function go(billRun) {
  try {
    const startTime = process.hrtime.bigint()

    const { id: billRunId, batchType, externalId } = billRun

    await ChargingModuleSendBillRunRequest.send(externalId)

    const externalBillRun = await _fetchChargingModuleBillRun(externalId)

    await _updateBills(externalBillRun)

    await _updateBillRun(billRunId, externalBillRun)

    if (batchType === 'supplementary' || batchType === 'two_part_supplementary') {
      await UnflagBilledSupplementaryLicencesService.go(billRun)
    }

    calculateAndLogTimeTaken(startTime, 'Send bill run complete', { billRun })
  } catch (error) {
    global.GlobalNotifier.omfg('Send bill run failed', billRun, error)
  }
}

async function _fetchChargingModuleBillRun(externalId) {
  const result = await ChargingModuleViewBillRunRequest.send(externalId)

  if (!result.succeeded) {
    throw new ExpandedError('Charging Module view bill run request failed', { billRunExternalId: externalId })
  }

  return result.response.body.billRun
}

async function _updateBills(externalBillRun) {
  const { invoices } = externalBillRun

  for (const invoice of invoices) {
    const { id, transactionReference: invoiceNumber } = invoice

    await BillModel.query().patch({ invoiceNumber }).where('externalId', id)
  }
}

async function _updateBillRun(billRunId, externalBillRun) {
  const { transactionFileReference } = externalBillRun

  return BillRunModel.query()
    .findById(billRunId)
    .patch({ status: 'sent', transactionFileReference, updatedAt: timestampForPostgres() })
}

module.exports = {
  go
}
