'use strict'

/**
 * Fetch live bill run(s) that match the options provided
 * @module FetchBillRunsForRegionService
 */

const BillRunModel = require('../../models/bill-run.model.js')

const LAST_PRESROC_YEAR = 2022

/**
 * Fetch live bill run(s) that match the options provided
 *
 * A bill run is 'live' if its status is queued, processing, ready or review. We have to check for live bill runs when
 * setting up a new one as this would stop the process.
 *
 * We only care about live bill runs for the region and financial year we're trying to create a new bill run in. It
 * doesn't matter what type they are; _any_ live bill runs will stop a new one being created.
 *
 * So, we fetch all live bill runs and order them by `createdAt DESC`. For annual and two-part tariff we take the first
 * and return that.
 *
 * Supplementary is more complicated. Because the period they span covers PRESROC and SROC we have to look in both the
 * year specified and 2022. This is because we need to determine if we can trigger both the PRESROC and SROC bill runs,
 * just one of them, or neither.
 *
 * > When you request the legacy service to create a supplementary bill run the request will include the current
 * > financial year's end date as the `financialEndYear`. The legacy service will then adjust this to be the last year
 * > of PRESROC; 2022. So, we know when it comes to supplementary we are always checking for matches in the current
 * > financial year and 2022.
 *
 * So, if the `supplementary` flag is true, we check the returned live bill run against the financial year end
 * specified or 2022 and if matched return it in the results. This means for supplementary we may return 0, 1 or 2
 * live bill runs.
 *
 * > The behaviour we're implementing was based on what the legacy service was doing.
 *
 * @param {string} regionId - UUID of the region to fetch live bill runs for
 * @param {number} financialYearEnding - The end year of the financial period to look at
 * @param {boolean} supplementary - true if we're trying to create a supplementary bill run else false
 *
 * @returns {Promise<object[]>} An array of `BillRunModel` which are live for the region and financial year specified
 */
async function go(regionId, financialYearEnding, supplementary) {
  const liveBillRuns = await _fetchLiveBillRuns(regionId)

  return _matchLiveBillRuns(liveBillRuns, financialYearEnding, supplementary)
}

async function _fetchLiveBillRuns(regionId) {
  return BillRunModel.query()
    .select(['id', 'batchType', 'billRunNumber', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding'])
    .where('regionId', regionId)
    .whereIn('status', ['queued', 'processing', 'ready', 'review'])
    .orderBy([
      { column: 'toFinancialYearEnding', order: 'desc' },
      { column: 'createdAt', order: 'desc' }
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select(['id', 'displayName'])
    })
}

function _matchLiveBillRuns(liveBillRuns, financialYearEnding, supplementary) {
  const matches = []

  for (const liveBillRun of liveBillRuns) {
    // Regardless of bill run type if the years match we have a matching live bill run
    if (liveBillRun.toFinancialYearEnding === financialYearEnding) {
      matches.push(liveBillRun)
    }

    // If the bill run we are checking for is supplementary we also need to check if there is a match for the last year
    // of PRESROC. This won't necessarily block the bill run from being created. But it will help the calling service
    // determine whether to ping the legacy app or not to create a PRESROC bill run
    if (supplementary && liveBillRun.toFinancialYearEnding === LAST_PRESROC_YEAR) {
      matches.push(liveBillRun)
    }
  }

  return matches
}

module.exports = {
  go
}
