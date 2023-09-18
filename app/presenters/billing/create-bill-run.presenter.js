'use strict'

/**
 * Formats the response for the POST `/bill-runs` endpoint
 * @module CreateBillRunPresenter
 */

function go (billRun) {
  const {
    billingBatchId: id,
    regionId: region,
    scheme,
    batchType,
    status,
    externalId,
    errorCode
  } = billRun

  return {
    id,
    region,
    scheme,
    batchType,
    status,
    externalId,
    errorCode
  }
}

module.exports = {
  go
}
