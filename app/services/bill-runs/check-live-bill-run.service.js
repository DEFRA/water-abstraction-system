'use strict'

/**
 * Checks whether a "live" bill run exists for the specified region, scheme, type and financial year
 * @module CheckLiveBillRunService
 */

const BillRunModel = require('../../models/bill-run.model.js')

const LIVE_STATUSES = ['processing', 'ready', 'review', 'queued']

/**
 * Check whether a "live" bill run exists for the specified region, scheme, type and financial year
 *
 * We define "live" as having the status `processing`, `ready`, `review` or `queued`. In the case of annual this also
 * includes `sent` and `sending`. This is because there should only ever be one annual bill run per region and
 * financial year.
 *
 * The process is that an annual bill run is generated at the start of the financial year then multiple supplementary
 * bill runs to deal with any changes after the annual bill run has been processed.
 *
 * @param {String} regionId The id of the region to be checked
 * @param {Number} toFinancialYearEnding The financial year to be checked
 * @param {String} batchType The bill run type to be checked
 *
 * @returns {Boolean} Whether a "live" bill run exists
 */
async function go (regionId, toFinancialYearEnding, batchType) {
  const statuses = [...LIVE_STATUSES]

  // Only one annual bill run per region and financial year is allowed. So, we include sent and sending in the statues
  // to check for
  if (batchType === 'annual') {
    statuses.push('sent', 'sending')
  }

  const numberOfLiveBillRuns = await BillRunModel.query()
    .select(1)
    .where({
      regionId,
      toFinancialYearEnding,
      batchType,
      scheme: 'sroc'
    })
    .whereIn('status', LIVE_STATUSES)
    .resultSize()

  return numberOfLiveBillRuns !== 0
}

module.exports = {
  go
}
