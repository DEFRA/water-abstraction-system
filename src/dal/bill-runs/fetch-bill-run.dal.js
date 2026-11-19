/**
 * Fetches data for a single bill run
 * @module FetchBillRunDal
 */

import BillRunModel from 'water-abstraction-engine/models/bill-run.model.js'

/**
 * Fetches data for a single bill run
 *
 * @param {string} billRunId - The UUID for the bill run to fetch
 *
 * @returns {Promise<object>} the matching instance of BillRunModel
 */
export default async function fetchBillRunDal(billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select(['id', 'batchType', 'createdAt', 'externalId', 'regionId', 'scheme', 'status', 'toFinancialYearEnding'])
}
