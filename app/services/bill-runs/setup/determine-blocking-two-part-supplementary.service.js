'use strict'

/**
 * Determines if an existing bill run will block a user from creating a new two-part supplementary bill run
 * @module DetermineBlockingTwoPartSupplementaryService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const FetchLiveBillRunService = require('./fetch-live-bill-run.service.js')
const { engineTriggers } = require('../../../lib/static-lookups.lib.js')

/**
 * Determines if an existing bill run will block a user from creating a new two-part supplementary bill run
 *
 * It first needs to determine what financial year the bill run will be for. When creating a two-part tariff
 * supplementary bill run, a user selects a year from a list of options. The options are dynamic and based on data in
 * the `licence_supplementary_billing_years` table. When a 2PT licence gets flagged for supplementary, the record
 * captures what year the change applies from.
 *
 * These years are shown to the user, from which they will pick one. That then becomes the 'toFinancialEndYear' for the
 * current bill run, as long as there exists a 2PT annual bill run for the same region and year.
 *
 * Next unlike the annual batch types, you can create as many 2PT supplementary bill runs per region, per financial year
 * as you like!
 *
 * Even better, unlike normal supplementary, we are only looking at the year selected by the user, and only have to deal
 * with one charge scheme.
 *
 * This means our match check is purely for any 'live' two-part tariff bill runs in the same region and financial year,
 * because of the rule that disallows more than one live bill run at a time.
 *
 * > We return an array because the same checks for standard supplementary might return multiple matches. So, we keep
 * > the results consistent for the orchestrating service
 *
 * @param {string} regionId - UUID of the region a bill run is being created for
 * @param {number} year - The year selected by the user for the bill run
 *
 * @returns {Promise<object>} Any blocking matches for the bill run being created, the `toFinancialYearEnding` to use
 * when creating it, and which bill run engine to trigger the creation with (if any)
 */
async function go(regionId, year) {
  const toFinancialYearEnding = await _toFinancialYearEnding(regionId, year)

  if (toFinancialYearEnding === 0) {
    return { matches: [], toFinancialYearEnding, trigger: engineTriggers.neither }
  }

  const match = await _fetchLiveBillRuns(regionId, toFinancialYearEnding)

  const matches = match ? [match] : []
  const trigger = match ? engineTriggers.neither : engineTriggers.current

  return { matches, toFinancialYearEnding, trigger }
}

async function _fetchLiveBillRuns(regionId, toFinancialYearEnding) {
  return BillRunModel.query()
    .select(['id', 'batchType', 'billRunNumber', 'createdAt', 'scheme', 'status', 'summer', 'toFinancialYearEnding'])
    .where('regionId', regionId)
    .where('toFinancialYearEnding', toFinancialYearEnding)
    .whereIn('batchType', ['two_part_tariff', 'two_part_supplementary'])
    .whereIn('status', ['queued', 'processing', 'ready', 'review'])
    .orderBy([{ column: 'createdAt', order: 'desc' }])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select(['id', 'displayName'])
    })
    .limit(1)
    .first()
}

async function _toFinancialYearEnding(regionId, year) {
  const billRun = await BillRunModel.query()
    .select(['id'])
    .where('regionId', regionId)
    .where('batchType', 'two_part_tariff')
    .where('status', 'sent')
    .where('toFinancialYearEnding', year)
    .limit(1)
    .first()

  // NOTE: We only expect to get a null billRun in non-production environments. When the batch type is 2PT supplementary we
  // have to confirm that there is a 'sent' 2PT annual for the same region and year. Else we have to block the bill run
  // from being created.
  //
  // But in some non-production environments a region might not have a 2PT annual bill run at all. When this is the case
  // billRun will be null. This used to throw an error that we let appear in the UI. We didn't want to add code for an
  // impossible situation. But even though this issue has been known about for a long time, we still get pings from
  // folks telling us 'change X has broken billing'. So, we now return 0 here when this happens, so we can handle it
  // gracefully and avoid the pings!
  return billRun ? year : 0
}

module.exports = {
  go
}
