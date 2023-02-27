'use strict'

/**
 * updates a billing batch status
 * @module UpdateBillingBatchStatusService
 */

const BillingBatchModel = require('../../models/water/billing-batch.model.js')

/**
 * Update the billing batch status
 */
async function go (billingBatchId, status) {
  const result = await BillingBatchModel.query()
    .findById(billingBatchId)
    .patch({ status })

  return result
}

module.exports = {
  go
}
