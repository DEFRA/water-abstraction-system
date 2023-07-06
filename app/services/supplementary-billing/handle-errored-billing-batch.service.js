'use strict'

/**
 * Handles an errored billing batch (setting status etc.)
 * @module HandleErroredBillingBatchService
 */

const BillingBatchModel = require('../../models/water/billing-batch.model.js')

/**
 * Sets the status of the specified billing batch to `error`, and logs an error if this can't be done.
 *
 * We keep this in a separate service so we don't need to worry about multiple/nested try-catch blocks in cases where a
 * billing batch fails and setting its status to error also fails.
 *
 * Note that although this is async we would generally not call it asynchronously as the intent is you can call it and
 * continue with whatever error logging is required
 *
 * @param {String} billingBatchId UUID of the billing batch to be marked with `error` status
 * @param {Number} [errorCode] Numeric error code as defined in BillingBatchModel. Defaults to `null`
 */
async function go (billingBatchId, errorCode = null) {
  try {
    await _updateBillingBatch(billingBatchId, errorCode)
  } catch (error) {
    global.GlobalNotifier.omfg('Failed to set error status on billing batch', { billingBatchId, errorCode }, error)
  }
}

async function _updateBillingBatch (billingBatchId, errorCode) {
  await BillingBatchModel.query()
    .findById(billingBatchId)
    .patch({
      status: 'error',
      errorCode
    })
}

module.exports = {
  go
}
