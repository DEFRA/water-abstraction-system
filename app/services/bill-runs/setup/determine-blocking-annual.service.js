'use strict'

/**
 * Determines if an existing bill run will block a user from creating a new annual bill run
 * @module DetermineBlockingAnnualService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const FetchLiveBillRunService = require('./fetch-live-bill-run.service.js')
const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')
const { engineTriggers } = require('../../../lib/static-lookups.lib.js')

/**
 * Determines if an existing bill run will block a user from creating a new annual bill run
 *
 * It first needs to determine what financial year the bill run will be for. Annual is always for the current financial
 * year (users don't get to select an option).
 *
 * You can only create one annual bill run per region, per financial year. So, our first check is to see if one already
 * exists.
 *
 * If there is no match, we return the results of a check for any bill runs with a status of 'queued', 'processing',
 * 'ready', or 'review' (a bill run is 'live').
 *
 * Where a region already has a 'live' bill run we do not permit users to create another one until it is completed.
 *
 * > We return an array because the same checks for supplementary might return multiple matches. So, we keep the results
 * > consistent for the orchestrating service
 *
 * @param {string} regionId - UUID of the region a bill run is being created for
 *
 * @returns {Promise<module:BillRunModel[]>} An array containing the matched bill run if found, otherwise the result of
 * calling `FetchLiveBillRunsService`
 */
async function go(regionId) {
  const toFinancialYearEnding = _toFinancialYearEnding()

  let match = await _fetchMatches(regionId, toFinancialYearEnding)

  if (!match) {
    match = await FetchLiveBillRunService.go(regionId, toFinancialYearEnding)
  }

  const matches = match ? [match] : []
  const trigger = match ? engineTriggers.neither : engineTriggers.current

  return { matches, toFinancialYearEnding, trigger }
}

async function _fetchMatches(regionId, toFinancialYearEnding) {
  return BillRunModel.query()
    .select(['id', 'batchType', 'billRunNumber', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding'])
    .where('regionId', regionId)
    .where('batchType', 'annual')
    .where('toFinancialYearEnding', toFinancialYearEnding)
    .whereNotIn('status', ['cancel', 'empty', 'error'])
    .orderBy([{ column: 'createdAt', order: 'desc' }])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select(['id', 'displayName'])
    })
    .limit(1)
    .first()
}

function _toFinancialYearEnding() {
  const currentFinancialYear = determineCurrentFinancialYear()

  return currentFinancialYear.endDate.getFullYear()
}

module.exports = {
  go
}
