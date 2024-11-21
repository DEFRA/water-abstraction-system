'use strict'

/**
 * Checks if a bill run can be cancelled, and if so, updates the status of the bill run to 'cancel'
 * @module CancelBillRunService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Checks if a bill run can be cancelled, and if so, updates the status of the bill run to 'cancel'
 *
 * If the bill run can be deleted (its status is not 'sending' or 'sent') then we are okay to mark it as cancelled and
 * to delete it and all related records.
 *
 * The deletion is done elsewhere but to support it we return the bill run instance fetched from the DB because it
 * includes the Charging Module API bill run ID (`externalId`).
 *
 * If we can mark the bill run as cancelled then the status of the instance returned will also be set to 'cancel'.
 *
 * @param {string} billRunId - UUID of the bill run to be cancelled
 *
 * @returns {Promise<module:BillRunModel>} the bill run including its `externalId` and status
 */
async function go (billRunId) {
  const billRun = await _fetchBillRun(billRunId)

  const canBeDeleted = _canBeDeleted(billRun.status)

  if (canBeDeleted) {
    await _updateStatus(billRunId)
    billRun.status = 'cancel'
  }

  return billRun
}

/**
 * We have intentionally left 'cancel' out of the list of invalid statuses. Arguably, you shouldn't be able to cancel a
 * bill run that is already being cancelled!
 *
 * But we know that there are existing 'stuck' cancelling bill runs at the time this gets shipped. Plus should an error
 * cause any future cancelling bill runs this will give us a 'backdoor' means of trying to remove them again.
 *
 * Because our version of cancel bill run redirects the user to the bill runs page as soon as the status is set it is
 * only by intention that someone could get back to the cancel bill run page. But it is this we intend to exploit to
 * clear up existing stuck bill runs and deal with any of our own in future!
 *
 * @private
 */
function _canBeDeleted (status) {
  const invalidStatusesForDeleting = ['sending', 'sent']

  return !invalidStatusesForDeleting.includes(status)
}

/**
 * This service handles the POST request from the confirm cancel bill run page. We _could_ have included the the
 * externalId as a hidden field in the form and included it in the request. This would give the impression we could
 * avoid a query to the DB.
 *
 * But we need to ensure no one exploits the `POST /bill-runs/{id}/cancel` endpoint to try and delete a 'sent' bill
 * run. So, we always have to fetch the bill run to check its status is not one that prevents us deleting it.
 *
 * @private
 */
async function _fetchBillRun (id) {
  return BillRunModel.query()
    .findById(id)
    .select([
      'id',
      'externalId',
      'status'
    ])
}

async function _updateStatus (billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .patch({ status: 'cancel', updatedAt: timestampForPostgres() })
}

module.exports = {
  go
}
