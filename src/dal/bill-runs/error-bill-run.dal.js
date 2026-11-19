/**
 * Sets the status of the specified bill run to `error`
 * @module ErrorBillRunDal
 */

import BillRunModel from 'water-abstraction-engine/models/bill-run.model.js'

/**
 * Sets the status of the specified bill run to `error`
 *
 * @param {string} billRunId - UUID of the bill run to be marked with `error` status
 * @param {number} [errorCode] - Numeric error code as defined in BillRunModel. Defaults to `null`
 */
export default async function errorBillRunDal(billRunId, errorCode = null) {
  await BillRunModel.query().findById(billRunId).patch({
    errorCode,
    status: 'error'
  })
}
