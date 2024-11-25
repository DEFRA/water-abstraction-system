'use strict'

/**
 * Determines if a licence with a change in return log should be flagged for supplementary billing
 * @module DetermineReturnLogFlagsService
 */

const { ref } = require('objection')

const ReturnLogModel = require('../../../models/return-log.model.js')

const SROC_START_DATE = new Date('2022-04-01')

/**
 * Determines if a licence should be flagged for supplementary billing based on a change on a return log
 *
 * The service determines which flags should be added to the licence based on the returnLogId it receives.
 * It uses the return logs dates and if the return is two-part tariff to decide the appropriate flags for supplementary
 * billing.
 *
 * Before we determine which flags to add to the licence we first determine which flags the licence already has so we
 * can maintain them. This is done when we declare our result object.
 *
 * If the returns start date is before the start date for sroc (1st April 2022), the licence is flagged for pre-sroc
 * supplementary billing
 *
 * If the returns end date is after the start date for sroc (1st April 2022) and the return is not two-part tariff, the
 * licence is flagged for sroc supplementary billing.
 *
 * If the return is two-part tariff then we flag it for twoPartTariffSupplementary and pass the start and end date of
 * the return through to the next service, where the two-part tariff years are determined.
 *
 * NOTE: Unlike pre-sroc and sroc flags (which apply at the licence level), two-part tariff flags are year specific.
 * They are stored in the `LicenceSupplementaryYears` table for each affected year of the charge version
 *
 * @param {string} returnLogId - The UUID for the return log to fetch
 *
 * @returns {object} - An object containing the related licenceId, regionId, return start and end date and licence
 * supplementary billing flags
 */
async function go(returnLogId) {
  const { twoPartTariff, licence, endDate, startDate } = await _fetchReturnLog(returnLogId)

  const result = {
    licenceId: licence.id,
    regionId: licence.regionId,
    startDate,
    endDate,
    flagForPreSrocSupplementary: licence.includeInPresrocBilling === 'yes',
    flagForSrocSupplementary: licence.includeInSrocBilling,
    flagForTwoPartTariffSupplementary: twoPartTariff
  }

  if (startDate < SROC_START_DATE) {
    result.flagForPreSrocSupplementary = true
  }

  if (!twoPartTariff && endDate > SROC_START_DATE) {
    result.flagForSrocSupplementary = true
  }

  return result
}

async function _fetchReturnLog(returnLogId) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select([
      'id',
      'licenceRef',
      'startDate',
      'endDate',
      ref('metadata:isTwoPartTariff').castBool().as('twoPartTariff')
    ])
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select(['id', 'regionId', 'includeInSrocBilling', 'includeInPresrocBilling'])
    })
}

module.exports = {
  go
}
