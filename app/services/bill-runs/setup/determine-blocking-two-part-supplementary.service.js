'use strict'

/**
 * Determines if an existing bill run will block a user from creating a new two-part supplementary bill run
 * @module DetermineBlockingTwoPartSupplementaryService
 */

const FetchLiveBillRunService = require('./fetch-live-bill-run.service.js')
const { engineTriggers } = require('../../../lib/static-lookups.lib.js')

/**
 * Determines if an existing bill run will block a user from creating a new two-part supplementary bill run
 *
 * Unlike the annual batch types, you can create as many supplementary bill runs per region, per financial year as you
 * like!
 *
 * Even better, unlike normal supplementary, we only look at the year selected by the user, and only have to deal with
 * one charge scheme.
 *
 * This means our match check is purely for any 'live' bill runs in the same region and financial year, because of the
 * rule that disallows more than one live bill run at a time.
 *
 * > We return an array because the same checks for supplementary might return multiple matches. So, we keep the results
 * > consistent for the orchestrating service
 *
 * @param {string} regionId - UUID of the region a bill run is being created for
 * @param {number} toFinancialYearEnding - The end year of the financial period the bill run will be for
 *
 * @returns {Promise<module:BillRunModel[]>} An array containing the matched bill run if found, otherwise the result of
 * calling `FetchLiveBillRunsService`
 */
async function go(regionId, toFinancialYearEnding) {
  const match = await FetchLiveBillRunService.go(regionId, toFinancialYearEnding)

  const matches = match ? [match] : []
  const trigger = match ? engineTriggers.neither : engineTriggers.current

  return { matches, toFinancialYearEnding, trigger }
}

module.exports = {
  go
}
