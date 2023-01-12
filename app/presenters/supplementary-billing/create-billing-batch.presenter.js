'use strict'

/**
 * Formats the response for the POST `/bill-runs` endpoint
 * @module CreateBillingBatchPresenter
 */

function go (billingBatch) {
  const {
    billingBatchId: id,
    regionId: region,
    scheme,
    batchType,
    status,
    externalId
  } = billingBatch

  return {
    id,
    region,
    scheme,
    batchType,
    status,
    externalId
  }
}

module.exports = {
  go
}
