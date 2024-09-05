'use strict'

/**
 * Formats the response for the POST `/bill-runs` endpoint
 * @module CreateBillRunPresenter
 */

/**
 * Formats a newly created bill run into the response needed by the legacy UI
 *
 * Because the legacy code does not use our views of the legacy data, the response needs to be formatted to use the
 * legacy field names.
 *
 * @param {module:BillRunModel} billRun - An instance of the newly created bill run
 *
 * @returns {object} the formatted response
 */
function go (billRun) {
  const {
    id: billingBatchId,
    regionId: region,
    scheme,
    batchType,
    status,
    externalId,
    errorCode
  } = billRun

  return {
    billingBatchId,
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
