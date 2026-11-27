/**
 * Fetches data for a single bill run including the region name
 * @module FetchBillRunDal
 */

import BillRunModel from 'water-abstraction-engine/models/bill-run.model.js'

/**
 * Fetches data for a single bill run including the region name
 *
 * @param {string} billRunId - The UUID for the bill run to fetch
 *
 * @returns {Promise<module:BillRunModel>} the matching instance of BillRunModel
 */
export default async function fetchBillRunDal(billRunId) {
  return BillRunModel.query()
    .findById(billRunId)
    .select(['id', 'batchType', 'billRunNumber', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding'])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select(['id', 'displayName'])
    })
}
