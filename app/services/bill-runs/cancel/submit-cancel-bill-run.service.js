'use strict'

/**
 * Orchestrates the cancelling of a bill run
 * @module SubmitCancelBillRunService
 */

const CancelBillBunService = require('./cancel-bill-run.service.js')
const DeleteBillRunService = require('./delete-bill-run.service.js')

/**
 * Orchestrates the cancelling of a bill run
 *
 * It first calls `CancelBillBunService` which will determine if the bill run _can_ be cancelled. If it can, it will
 * update the status of the bill run to 'cancel'.
 *
 * It returns the fetched instance of the bill run, with the status set to 'cancel' if the bill run was cancelled.
 *
 * It then calls `DeleteBillRunService` which will delete the bill run and all its associated records. It will also
 * send a delete request to the Charging Module API.
 *
 * We specifically do not await the `DeleteBillRunService` call here as we do not want to block the request. This
 * is because it can take up to 30 mins to delete everything associated with a bill run!
 *
 * @param {string} billRunId  - UUID of the bill run to be cancelled
 */
async function go(billRunId) {
  const billRun = await CancelBillBunService.go(billRunId)

  if (billRun.status === 'cancel') {
    DeleteBillRunService.go(billRun)
  }
}

module.exports = {
  go
}
