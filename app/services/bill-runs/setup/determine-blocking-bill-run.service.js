'use strict'

/**
 * Determines if an existing bill run blocks the one a user is trying to setup
 * @module DetermineBlockingBillRunService
 */

const DetermineBlockingAnnualService = require('./determine-blocking-annual.service.js')
const DetermineBlockingSupplementaryService = require('./determine-blocking-supplementary.service.js')
const DetermineBlockingTwoPartAnnualService = require('./determine-blocking-two-part-annual.service.js')
const DetermineBlockingTwoPartSupplementaryService = require('./determine-blocking-two-part-supplementary.service.js')

/**
 * Determines if an existing bill run blocks the one a user is trying to setup
 *
 * Once the user completes the bill run setup journey we first need to check if a matching bill run already exists.
 *
 * The criteria though can differ depending on the details selected. For example, you can only have 1 annual bill run
 * per region per year. Supplementary you can have as many as you like but never more than one in process. Two-part
 * tariff, depending on the year, you can have either 2 or 1 because of the summer and winter cycles.
 *
 * All this needs to be taken into account when determining if a 'matching' bill run exists.
 *
 * Once we have a match, we then need to determine what, if any, bill runs we can trigger. In summary, for annual
 * or two-part tariff annual, if a match is found you cannot trigger them.
 *
 * Supplementary gets complex because
 *
 * - you can create more than one in a year for a region
 * - for non two-part tariff, both engines have to be triggered to cover the 6 year billing period
 *
 * So, we might have matches, but as long as they are 'sent' we can proceed. If only one is 'sent', we can still trigger
 * one of the bill run engines, but we have to figure out which one first.
 *
 * Two-part tariff supplementary is the easiest: we just need to check if there are any 'live' bill runs.
 *
 * @param {object} session - The bill run setup session instance
 *
 * @returns {Promise<object>} Any blocking matches for the bill run being created, the `toFinancialYearEnding` to use
 * when creating it, and which bill run engine to trigger the creation with (if any)
 */
async function go(session) {
  const { region, season, type, year } = session

  if (type === 'supplementary') {
    return DetermineBlockingSupplementaryService.go(region)
  }

  if (type === 'two_part_supplementary') {
    return DetermineBlockingTwoPartSupplementaryService.go(region, year)
  }

  if (type === 'two_part_tariff') {
    const summer = season === 'summer'

    return DetermineBlockingTwoPartAnnualService.go(region, year, summer)
  }

  return DetermineBlockingAnnualService.go(region)
}

module.exports = {
  go
}
