'use strict'

/**
 * Handles an errored bill run (setting status etc.)
 * @module HandleErroredBillRunService
 */

const BillRunModel = require('../../models/bill-run.model.js')

/**
 * Sets the status of the specified bill run to `error`, and logs an error if this can't be done.
 *
 * We keep this in a separate service so we don't need to worry about multiple/nested try-catch blocks in cases where a
 * bill run fails and setting its status to error also fails.
 *
 * Note that although this is async we would generally not call it asynchronously as the intent is you can call it and
 * continue with whatever error logging is required
 *
 * @param {string} billRunId - UUID of the bill run to be marked with `error` status
 * @param {number} [errorCode] - Numeric error code as defined in BillRunModel. Defaults to `null`
 */
async function go (billRunId, errorCode = null) {
  try {
    await _updateBillRun(billRunId, errorCode)
  } catch (error) {
    global.GlobalNotifier.omfg('Failed to set error status on bill run', { billRunId, errorCode }, error)
  }
}

async function _updateBillRun (billRunId, errorCode) {
  await BillRunModel.query()
    .findById(billRunId)
    .patch({
      status: 'error',
      errorCode
    })
}

module.exports = {
  go
}
