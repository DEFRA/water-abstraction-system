'use strict'

/**
 * Orchestrates the sending of a bill run
 * @module SubmitSendBillRunService
 */

const BillModel = require('../../../models/bill.model.js')
const BillRunModel = require('../../../models/bill-run.model.js')
const ExpandedError = require('../../../errors/expanded.error.js')
const { calculateAndLogTimeTaken, timestampForPostgres } = require('../../../lib/general.lib.js')
const ChargingModuleSendBillRunRequest = require('../../../requests/charging-module/send-bill-run.request.js')
const ChargingModuleViewBillRunRequest = require('../../../requests/charging-module/view-bill-run.request.js')
const UnflagBilledLicencesService = require('../supplementary/unflag-billed-licences.service.js')

/**
 * Orchestrates the sending of a bill run
 *
 * After checking that the bill run has a status that can be sent (only ready bill runs can be sent)
 * we set the status of the bill run to `sending`. At this point we return control to the controller so that it can
 * redirect the user to the bill runs page.
 *
 * Meantime now in the background, we send a request to the Charging Module API to send the bill run there. Once that
 * process is complete we get the updated bill run summary and extract the generated bill numbers and transaction file
 * reference from it.
 *
 * It can take the CHA more than a second to complete the send process for larger bill runs. This is why we hand back
 * control to the UI early so we don't block the user or cause a timeout.
 *
 * @param {string} billRunId - UUID of the bill run to be sent
 *
 * @returns {Promise} the promise returned is not intended to resolve to any particular value
 */
async function go (billRunId) {
  const billRun = await _fetchBillRun(billRunId)

  if (billRun.status !== 'ready') {
    throw new ExpandedError('Cannot send a bill run that is not ready', { billRunId })
  }

  await _updateStatus(billRunId, 'sending')

  // NOTE: We originally believed that should anything error in _sendBillRun() the try/catch in the controller would
  // catch it. However, when testing this theory we found it crashed the test framework. So, we tried it for real and
  // again confirmed we'd crash the service. The controller would never see the error. It is because we are not awaiting
  // this call that any errors thrown are considered uncaught. However, if we instead use the ES6 variant the error _is_
  // caught. All we can do at this point is log it.
  _sendBillRun(billRun).catch((error) => {
    global.GlobalNotifier.omfg(error.message, { billRunId }, error)
  })
}

/**
 * This service handles the POST request from the confirm sent bill run page. We _could_ have included the
 * externalId as a hidden field in the form and included it in the request. This would give the impression we could
 * avoid a query to the DB.
 *
 * But we need to ensure no one exploits the `POST /bill-runs/{id}/send` endpoint. So, we always have to fetch the bill
 * run to check its status is not one that prevents us deleting it.
 *
 * @private
 */
async function _fetchBillRun (id) {
  return BillRunModel.query()
    .findById(id)
    .select([
      'id',
      'batchType',
      'createdAt',
      'externalId',
      'regionId',
      'scheme',
      'status'
    ])
}

async function _fetchChargingModuleBillRun (externalId) {
  const result = await ChargingModuleViewBillRunRequest.send(externalId)

  if (!result.succeeded) {
    throw new ExpandedError('Charging Module view bill run request failed', { billRunExternalId: externalId })
  }

  return result.response.body.billRun
}

async function _sendBillRun (billRun) {
  const startTime = process.hrtime.bigint()

  const { id: billRunId, externalId } = billRun

  await ChargingModuleSendBillRunRequest.send(externalId)

  const externalBillRun = await _fetchChargingModuleBillRun(externalId)

  await _updateInvoiceData(externalBillRun)

  await _updateBillRunData(billRun, externalBillRun)

  if (billRun.batchType === 'supplementary') {
    await UnflagBilledLicencesService.go(billRun)
  }

  calculateAndLogTimeTaken(startTime, 'Send bill run complete', { billRunId })
}

async function _updateBillRunData (billRun, externalBillRun) {
  const { transactionFileReference } = externalBillRun

  return billRun.$query().patch({ status: 'sent', transactionFileReference })
}

async function _updateInvoiceData (externalBillRun) {
  const { invoices } = externalBillRun

  for (const invoice of invoices) {
    const { id, transactionReference: invoiceNumber } = invoice

    await BillModel.query().patch({ invoiceNumber }).where('externalId', id)
  }
}

async function _updateStatus (billRunId, status) {
  return BillRunModel.query()
    .findById(billRunId)
    .patch({ status, updatedAt: timestampForPostgres() })
}

module.exports = {
  go
}
