'use strict'

/**
 * Determines if an existing bill run will block a user from creating a new supplementary bill run
 * @module DetermineBlockingSupplementaryService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { engineTriggers } = require('../../../lib/static-lookups.lib.js')

const LAST_PRESROC_YEAR = 2022

/**
 * Determines if an existing bill run will block a user from creating a new supplementary bill run
 *
 * Unlike the annual batch types, you can create as many supplementary bill runs per region, per financial year as you
 * like!
 *
 * However, it is complicated by the fact supplementary has to cover a 6 year period and in 1 April 2022 the charge
 * scheme changed. This means a PRESROC (old engine), and an SROC (current engine) bill run has to be created when
 * setting up a supplementary bill run.
 *
 * Because of this, we may get multiple matches, or just one. If we get a match for both an SROC and PRESROC bill run
 * the supplementary bill run will be blocked. But if we get just one match, only that charge scheme's bill run is
 * blocked. For example, if we find an SROC bill run in progress, but no match for PRESROC, we'll allow the user to
 * proceed and we'll just trigger the old engine.
 *
 * We don't match against batch type for supplementary because you are allowed multiple supplementaries. So, we are just
 * checking for any bill run with a status of 'queued', 'processing', 'ready', or 'review' in the matching region
 * and year because the rule of just one 'live' bill run still applies.
 *
 * @param {string} regionId - UUID of the region a bill run is being created for
 * @param {number} toFinancialYearEnding - The end year of the financial period the bill run will be for
 *
 * @returns {Promise<module:BillRunModel[]>} An array containing the matched bill runs if found
 */
async function go(regionId, toFinancialYearEnding) {
  const srocMatch = await _fetchSrocMatch(regionId, toFinancialYearEnding)
  const presrocMatch = await _fetchPresrocMatch(regionId)

  // Return both after filtering out any that is null
  const matches = [srocMatch, presrocMatch].filter((match) => {
    return match
  })

  const trigger = _trigger(matches)

  return { matches, toFinancialYearEnding, trigger }
}

async function _fetchSrocMatch(regionId, toFinancialYearEnding) {
  return BillRunModel.query()
    .select(['id', 'batchType', 'billRunNumber', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding'])
    .where('scheme', 'sroc')
    .where('regionId', regionId)
    .where('toFinancialYearEnding', toFinancialYearEnding)
    .whereNotIn('status', ['cancel', 'empty', 'error', 'sending', 'sent'])
    .orderBy([{ column: 'createdAt', order: 'desc' }])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select(['id', 'displayName'])
    })
    .limit(1)
    .first()
}

async function _fetchPresrocMatch(regionId) {
  return BillRunModel.query()
    .select(['id', 'batchType', 'billRunNumber', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding'])
    .where('scheme', 'alcs')
    .where('regionId', regionId)
    .where('toFinancialYearEnding', '<=', LAST_PRESROC_YEAR)
    .whereNotIn('status', ['cancel', 'empty', 'error', 'sending', 'sent'])
    .orderBy([{ column: 'createdAt', order: 'desc' }])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select(['id', 'displayName'])
    })
    .limit(1)
    .first()
}

function _trigger(matches) {
  if (matches.length === 2) {
    return engineTriggers.neither
  }

  if (matches.length === 0) {
    return engineTriggers.both
  }

  if (matches[0].scheme === 'alcs') {
    return engineTriggers.current
  }

  return engineTriggers.old
}

module.exports = {
  go
}
