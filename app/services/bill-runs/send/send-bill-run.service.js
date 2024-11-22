'use strict'

/**
 * Checks if a bill run can be sent, and if so, updates the status of the bill run to 'sending'
 * @module SendBillRunService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Checks if a bill run can be sent, and if so, updates the status of the bill run to 'sending'
 *
 * If the bill run can be sent (its status is 'ready') then we are okay to mark it as sending, tell the Charging Module
 * API to do the same, and then update the bill run data with the generated CHA invoice numbers.
 *
 * The request to the CHA and the updating is done elsewhere but to support it we return the bill run instance fetched
 * from the DB because it includes the Charging Module API bill run ID (`externalId`).
 *
 * If we can mark the bill run as sending then the status of the instance returned will also be set to 'sending'.
 *
 * @param {string} billRunId - UUID of the bill run to be sent
 *
 * @returns {Promise<module:BillRunModel>} the bill run including its `externalId` and status
 */
async function go(billRunId) {
  const billRun = await _fetchBillRun(billRunId)

  if (billRun.status === 'ready') {
    await _updateStatus(billRunId)
    billRun.status = 'sending'
  }

  return billRun
}

/**
 * This service is called as part of the POST request from the confirm send bill run page. We _could_ have included the
 * externalId as a hidden field in the form and included it in the request. This would give the impression we could
 * avoid a query to the DB.
 *
 * But we need to ensure no one exploits the `POST /bill-runs/{id}/send` endpoint to try and send a bill run that is not
 * 'ready'. So, we always have to fetch the bill run to check its status is not one that prevents us sending it.
 *
 * Also, it looks like we are fetching far more detail than we need. It is because we return this instance to
 * `SubmitSendBillRunService`, which then calls `UpdateInvoiceNumbersService`, which in turn may call
 * `UnflagBilledLicencesService`. These extra details are needed by them.
 *
 * @private
 */
async function _fetchBillRun(id) {
  return BillRunModel.query()
    .findById(id)
    .select(['id', 'batchType', 'createdAt', 'externalId', 'regionId', 'scheme', 'status'])
}

async function _updateStatus(billRunId) {
  return BillRunModel.query().findById(billRunId).patch({ status: 'sending', updatedAt: timestampForPostgres() })
}

module.exports = {
  go
}
