'use strict'

/**
 * Determines if an existing bill run will block a user from creating a new supplementary bill run
 * @module DetermineBlockingSupplementaryService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')
const { engineTriggers } = require('../../../lib/static-lookups.lib.js')

const LAST_PRESROC_YEAR = 2022

/**
 * Determines if an existing bill run will block a user from creating a new supplementary bill run
 *
 * It first needs to determine what financial year the bill run will be for. Supplementary is always assumed to be for
 * the current year, but this can change. We want our users to be able to create supplementary bill runs all year round.
 * However, when the financial year switches over if the annual bill run for a region has not been run, creating a
 * supplementary will cause problems.
 *
 * Annual bill runs do not take into account what has been billed that year. They just work through the valid charge
 * versions for the region and financial year, generate the transactions and send them to the Charging Module API to
 * create a charge and a bill run.
 *
 * Because of this if a supplementary is created _before_ the annual, customers will get charged twice. So, to avoid
 * this when a user is attempting to create a supplementary bill run we have to determine when the last 'sent' annual
 * bill run was. If its end year matches the current year we do nothing.
 *
 * If it doesn't, we 'bump' the financial end year to back to the year of the last annual bill run.
 *
 * > In production this will always result in a year being found. In non-production though this can result in 0
 * > returned, because a region does not have an annual bill run record.
 *
 * Next unlike the annual batch types, you can create as many supplementary bill runs per region, per financial year as
 * you like!
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
 * checking for any bill run with a status of 'queued', 'processing', 'ready', or 'review' in the matching region and
 * year because the rule of just one 'live' bill run still applies.
 *
 * @param {string} regionId - UUID of the region a bill run is being created for
 *
 * @returns {Promise<object>} Any blocking matches for the bill run being created, the `toFinancialYearEnding` to use
 * when creating it, and which bill run engine to trigger the creation with (if any)
 */
async function go(regionId) {
  const toFinancialYearEnding = await _toFinancialYearEnding(regionId)

  if (toFinancialYearEnding === 0) {
    return { matches: [], toFinancialYearEnding, trigger: engineTriggers.neither }
  }

  const srocMatch = await _fetchSrocMatch(regionId, toFinancialYearEnding)
  const presrocMatch = await _fetchPresrocMatch(regionId)

  // Return both after filtering out any that is null
  const matches = [srocMatch, presrocMatch].filter((match) => {
    return match
  })

  const trigger = _trigger(matches, toFinancialYearEnding)

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

async function _toFinancialYearEnding(regionId) {
  const currentFinancialYear = determineCurrentFinancialYear()
  const currentFinancialYearEnd = currentFinancialYear.endDate.getFullYear()

  const billRun = await BillRunModel.query()
    .select(['id', 'toFinancialYearEnding'])
    .where('regionId', regionId)
    .where('batchType', 'annual')
    .where('status', 'sent')
    // NOTE: We would never have an annual bill run with a toFinancialYearEnding greater than the current one in a
    // 'real' environment. But we often manipulate bill run dates whilst testing to move annual bill runs out of the
    // way. We would hate to break this ability so we have logic to only look at sent annual bill runs with an end year
    // less than or equal to the current financial end year
    .where('toFinancialYearEnding', '<=', currentFinancialYearEnd)
    .orderBy('toFinancialYearEnding', 'desc')
    .limit(1)
    .first()

  // NOTE: We only expect to get a null billRun in non-production environments. When the batch type is supplementary we
  // have to work back to when the last annual bill run for that region was sent. This becomes the financial year end
  // that can be used for the supplementary bill run.
  //
  // But in some non-production environments a region might not have an annual bill run at all. When this is the case
  // billRun will be null. This used to throw an error that we let appear in the UI. We didn't want to add code for an
  // impossible situation. But even though this issue has been known about for a long time, we still get pings from
  // folks telling us 'change X has broken billing'. So, we now return 0 here when this happens, so we can handle it
  // gracefully and avoid the pings!
  return billRun ? billRun.toFinancialYearEnding : 0
}

function _trigger(matches, toFinancialYearEnding) {
  if (matches.length === 2) {
    return engineTriggers.neither
  }

  if (matches.length === 0) {
    if (toFinancialYearEnding > 2022) {
      return engineTriggers.both
    }

    // NOTE: This is protecting an edge case you can get in non-production environments, but not in production. There
    // are no blocking bill runs, but the last annual was a PRESROC. So, `toFinancialYearEnding` has been determined as
    // a PRESROC year. This means we should only allow the legacy supplementary bill run to be triggered.
    return engineTriggers.old
  }

  if (matches[0].scheme === 'alcs') {
    return engineTriggers.current
  }

  return engineTriggers.old
}

module.exports = {
  go
}
