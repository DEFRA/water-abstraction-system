'use strict'

/**
 * Fetches the latest 'live' bill run for the supplied region and financial year
 * @module FetchLiveBillRunService
 */

const BillRunModel = require('../../../models/bill-run.model.js')

/**
 * Fetches the latest 'live' bill run for the supplied region and financial year
 *
 * A bill run is 'live' if its status is queued, processing, ready or review. We have to check for live bill runs when
 * setting up a new one, as we only allow one 'live' bill run per region and financial year.
 *
 * @param {string} regionId - UUID of the region to check
 * @param {number} toFinancialYearEnding - The end year of the financial period
 *
 * @returns {Promise<module:BillRunModel>} The latest 'live' bill run
 */
async function go(regionId, toFinancialYearEnding) {
  return BillRunModel.query()
    .select(['id', 'batchType', 'billRunNumber', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding'])
    .where('regionId', regionId)
    .where('toFinancialYearEnding', toFinancialYearEnding)
    .whereIn('status', ['queued', 'processing', 'ready', 'review'])
    .orderBy([{ column: 'createdAt', order: 'desc' }])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select(['id', 'displayName'])
    })
    .limit(1)
    .first()
}

module.exports = {
  go
}
