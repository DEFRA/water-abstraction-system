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
 * @param {string} billingBatchId UUID of the billing batch to be marked with `error` status
 */
async function go (billingBatchId) {
  try {
    await _updateStatus(billingBatchId)
  } catch (error) {
    global.GlobalNotifier.omfg('Failed to set error status on billing batch', { error, billingBatchId })
  }
}

async function _updateStatus (billingBatchId) {
  await BillingBatchModel.query()
    .findById(billingBatchId)
    .patch({ status: 'error' })
}

module.exports = {
  go
}
