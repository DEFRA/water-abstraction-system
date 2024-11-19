'use strict'

/**
 * Determine the financial end year to use for a new bill run
 * @module DetermineFinancialEndYearService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')

/**
 * Determine the financial year to use for a new bill run
 *
 * Used by the `ExistsService` when determining what financial end year to use for a bill run.
 *
 * In the case of annual it is simply the current financial year end.
 *
 * For two-part tariff it is the year selected by the user.
 *
 * Supplementary billing is more complicated. Generally, it also is the current financial year end. But we want our
 * users to be able to create supplementary bill runs all year round. However, when the financial year switches over if
 * the annual bill run for a region has not been run a supplementary will cause problems.
 *
 * Annual bill runs do not take into account what has been billed that year. They just work through the valid charge
 * versions for the region and financial year, generate the transactions and send them to the Charging Module API to
 * create a charge and a bill run.
 *
 * Because of this if a supplementary is created _before_ the annual customers will get charged twice. So, to avoid this
 * when a user is attempting to create a supplementary bill run we have to determine when the last 'sent' annual bill
 * run was. If its end year matches the current year we do nothing.
 *
 * If it doesn't, we 'bump' the financial end year to back to the year of the last annual bill run.
 *
 * @param {string} regionId - UUID of the region to determine the financial end year for
 * @param {string} billRunType - The type of bill run to determine the end year for, for example, 'annual'
 * @param {number} [year] - The year selected by the user
 *
 * @returns {Promise<number>} The financial end year to use for selected bill run type and region
 */
async function go (regionId, billRunType, year = null) {
  const currentFinancialYear = determineCurrentFinancialYear()
  const currentFinancialYearEnd = currentFinancialYear.endDate.getFullYear()

  if (billRunType === 'supplementary') {
    return _determineSupplementaryEndYear(regionId, currentFinancialYearEnd)
  }

  if (year && billRunType.startsWith('two_part')) {
    return Number(year)
  }

  return currentFinancialYearEnd
}

async function _determineSupplementaryEndYear (regionId, currentFinancialYearEnd) {
  const billRun = await BillRunModel.query()
    .select([
      'id',
      'toFinancialYearEnding'
    ])
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

  return billRun.toFinancialYearEnding
}

module.exports = {
  go
}
