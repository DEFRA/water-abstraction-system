'use strict'

/**
 * Determines if an existing bill run will block a user from creating a new two-part annual bill run
 * @module DetermineBlockingTwoPartAnnualService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const FetchLiveBillRunService = require('./fetch-live-bill-run.service.js')
const { engineTriggers } = require('../../../lib/static-lookups.lib.js')

const LAST_PRESROC_YEAR = 2022

/**
 * Determines if an existing bill run will block a user from creating a new two-part annual bill run
 *
 * It first needs to determine what financial year the bill run will be for. Two-part tariff annual, currently, is
 * whatever year the user selected until such time as the backlog is cleared. It will then be the same as standard
 * annual: the current financial year.
 *
 * You can only create one SROC two-part annual bill run per region, per financial year. For PRESROC, its one per
 * region, financial year, and cycle (summer or winter). So, our first check is to see if one already exists.
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
 * @param {number} year - The year selected by the user for the bill run
 * @param {boolean} [summer] - Applies only to PRESROC two-part tariff. Whether the bill run is summer or winter
 * all-year
 *
 * @returns {Promise<object>} Any blocking matches for the bill run being created, the `toFinancialYearEnding` to use
 * when creating it, and which bill run engine to trigger the creation with (if any)
 */
async function go(regionId, year, summer = false) {
  const toFinancialYearEnding = _toFinancialYearEnding(year)

  let match = await _fetchMatches(regionId, toFinancialYearEnding, summer)

  if (!match) {
    match = await FetchLiveBillRunService.go(regionId, toFinancialYearEnding)
  }

  const matches = match ? [match] : []
  const trigger = _trigger(match, toFinancialYearEnding)

  return { matches, toFinancialYearEnding, trigger }
}

async function _fetchMatches(regionId, toFinancialYearEnding, summer) {
  return BillRunModel.query()
    .select(['id', 'batchType', 'billRunNumber', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding'])
    .where('regionId', regionId)
    .where('batchType', 'two_part_tariff')
    .where('toFinancialYearEnding', toFinancialYearEnding)
    .whereNotIn('status', ['cancel', 'empty', 'error'])
    .where('summer', summer)
    .orderBy([
      { column: 'toFinancialYearEnding', order: 'desc' },
      { column: 'createdAt', order: 'desc' }
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select(['id', 'displayName'])
    })
    .limit(1)
    .first()
}

function _toFinancialYearEnding(year) {
  return Number(year)
}

function _trigger(match, toFinancialYearEnding) {
  if (match) {
    return engineTriggers.neither
  }

  if (toFinancialYearEnding > LAST_PRESROC_YEAR) {
    return engineTriggers.current
  }

  return engineTriggers.old
}

module.exports = {
  go
}
