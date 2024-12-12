'use strict'

/**
 * Determines if an existing bill run blocks the one a user is trying to setup
 * @module DetermineBlockingBillRunService
 */

const DetermineFinancialYearEndService = require('./determine-financial-year-end.service.js')
const { engineTriggers } = require('../../../lib/static-lookups.lib.js')

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
 * @returns {Promise<object>} Any matching bill runs, the year it determined would be used for
 * `toFinancialYearEnding`, and what bill runs to trigger (if any)
 */
async function go(session) {
  const toFinancialYearEnding = await _toFinancialYearEnding(session)
  const result = await _determineBlockingBillRun(session, toFinancialYearEnding)

  return result
}

async function _determineBlockingBillRun(session, toFinancialYearEnding) {
  // If toFinancialYearEnding is 0 then we are dealing with the non-prod scenario of trying to create a supplementary in
  // a region with no bill run. There is no point checking for a blocking bill run in this case.
  if (toFinancialYearEnding === 0) {
    return { matches: [], toFinancialYearEnding, trigger: engineTriggers.neither }
  }

  const { region, season, type } = session

  if (type === 'supplementary') {
    return DetermineBlockingSupplementaryService.go(region, toFinancialYearEnding)
  }

  if (type === 'two_part_supplementary') {
    return DetermineBlockingTwoPartSupplementaryService.go(region, toFinancialYearEnding)
  }

  if (type === 'two_part_tariff') {
    const summer = season === 'summer'

    return DetermineBlockingTwoPartAnnualService.go(region, toFinancialYearEnding, summer)
  }

  return DetermineBlockingAnnualService.go(region, toFinancialYearEnding)
}

/**
 * For annual, the current date will determine what year to use for the bill run's financial year ending.
 *
 * For 2PT tariff annual, currently we ask users to select it in the journey, as there is a backlog to clear. In the
 * future though, it to will be determined by the current year.
 *
 * Supplementary used to be determined by the current year, and users were expected to hold off until all annual bill
 * runs had been processed before creating new ones. However, in 2024 in time for annual billing in April, we were asked to amend the
 * functionality to allow users to still create supplementary bill runs even if the annual had not yet been created. Our
 * logic in `DetermineFinancialYearEndService` has to find the date of the last annual bill run for the same region, and
 * set `toFinancialYearEnding` to match.
 *
 * For example, if the Anglian 2024-25 annual bill run has not yet been run, a user creating a supplementary bill run
 * would see `toFinancialYearEnding` set to 2024 (2023-24) because that was when the last Anglian annual bill run was
 * for. Changes to licences in 2024-25 will be picked up by the annual, and changes before then can still be processed
 * without delay.
 * @private
 */
async function _toFinancialYearEnding(session) {
  const { region, type, year } = session

  try {
    return await DetermineFinancialYearEndService.go(region, type, year)
  } catch (error) {
    // NOTE: We only expect to get this error in non-production environments. When the batch type is supplementary we
    // have to work back to when the last annual bill run for that region was sent. This becomes the financial year end
    // that can be used for the supplementary bill run.
    //
    // But in some non-production environments a region might not have an annual bill run at all. When this is the case
    // DetermineFinancialYearEndService throws an error. We used to let the error appear in the UI. But even though
    // this issue has been known about for a long time, we still get pings from folks telling us 'change X has broken
    // billing'. So, we now return 0 here when this happens, so the presenter can display a message to the user.
    return 0
  }
}

module.exports = {
  go
}
