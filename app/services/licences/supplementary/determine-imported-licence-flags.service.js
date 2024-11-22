'use strict'

/**
 * @module DetermineImportedLicenceFlagsService
 */

const FetchExistingLicenceDetailsService = require('./fetch-existing-licence-details.service.js')
const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')

const SROC_START_DATE = new Date('2022-04-01')

/**
 * Determines if a licence should be flagged for supplementary billing based on changes to the expired/lapsed/revoked
 * dates
 *
 * This service is triggered when an end date change has already been confirmed and determines the appropriate
 * supplementary billing flags (Pre-SROC, SROC, or two-part tariff) for the licence. It compares the updated end
 * dates on the imported licence with the existing licence details to identify which flags to apply.
 *
 * Specifically:
 * - Flags for Pre-SROC if the change affects dates before the SROC start date (2022-04-01) and the licence has
 * Pre-SROC charge versions.
 * - Flags for SROC if the change affects dates on or after the SROC start date and the licence has SROC charge versions
 * - Flags for two-part tariff if the change affects dates on or after SROC start and the licence has two-part tariff
 * charge versions.
 *
 * Unlike Pre-SROC and SROC flags, this flag applies at the year level and is stored in the `LicenceSupplementaryYears`
 * table for each affected year.
 *
 * Before assessing date changes to add new flags, we first validate the existing pre-sroc and sroc flags.
 * This gives us an opportunity to remove any flags on the licence that will never get removed normally because the
 * licence doesn't have the correct charge versions to get picked up in a bill run. The service this passes
 * back to always persists the flags it receives so we do this check before we check the dates.
 *
 * @param {object} importedLicence - Object representing the updated licence being imported
 * @param {string} licenceId - The UUID of the licence being imported
 *
 * @returns {Promise} A promise is returned but it does not resolve to anything we expect the caller to use
 */
async function go(importedLicence, licenceId) {
  const existingLicenceDetails = await FetchExistingLicenceDetailsService.go(licenceId)
  const { endDate } = determineCurrentFinancialYear()
  const earliestChangedDate = _earliestChangedDate(importedLicence, existingLicenceDetails, endDate)
  const { flagForSrocSupplementary, flagForPreSrocSupplementary } = _determineExistingFlags(existingLicenceDetails)

  const result = {
    licenceId: existingLicenceDetails.id,
    regionId: existingLicenceDetails.region_id,
    startDate: earliestChangedDate,
    endDate,
    flagForPreSrocSupplementary,
    flagForSrocSupplementary,
    flagForTwoPartTariffSupplementary: false
  }

  // If not set it means none of the dates changed were before the current financial year end so there is no reason
  // to change anything on the flags
  if (!earliestChangedDate) {
    return result
  }

  _updateFlags(earliestChangedDate, existingLicenceDetails, flagForPreSrocSupplementary, result)

  return result
}

/**
 * If the licence is already flagged for SROC supplementary billing, set the flag based on whether the licence
 * has SROC charge versions. This way, if the licence lacks charge versions, the flag is removed by setting it
 * to false; otherwise, it stays true. We check this because this is an opportunity to remove sroc supplementary
 * billing flags from a licence that won't ever be picked up by the sroc billing engine (so the flag will never get
 * removed). The same principles applies to the pre sroc flag
 *
 * @private
 */
function _determineExistingFlags(existingLicenceDetails) {
  const flagForSrocSupplementary = existingLicenceDetails.flagged_for_sroc
    ? existingLicenceDetails.sroc_charge_versions
    : false

  const flagForPreSrocSupplementary = existingLicenceDetails.flagged_for_presroc
    ? existingLicenceDetails.pre_sroc_charge_versions
    : false

  return { flagForSrocSupplementary, flagForPreSrocSupplementary }
}

function _earliestChangedDate(importedLicence, existingLicenceDetails, currentFinancialYearEndDate) {
  const changedDates = []

  let date

  // NOTE: In JavaScript, comparing date objects directly can lead to incorrect results, as two date objects, even with
  // the same date and time, are treated as different objects. To avoid this, we convert the dates to strings for
  // comparison. Normally, you might use getTime() to compare dates, but since any of these values can be null, calling
  // getTime() on a null value would result in an error. Using strings safely handles null values.
  if (String(importedLicence.expiredDate) !== String(existingLicenceDetails.expired_date)) {
    date = importedLicence.expiredDate ?? existingLicenceDetails.expired_date
    changedDates.push(date)
  }

  if (String(importedLicence.lapsedDate) !== String(existingLicenceDetails.lapsed_date)) {
    date = importedLicence.lapsedDate ?? existingLicenceDetails.lapsed_date
    changedDates.push(date)
  }

  if (String(importedLicence.revokedDate) !== String(existingLicenceDetails.revoked_date)) {
    date = importedLicence.revokedDate ?? existingLicenceDetails.revoked_date
    changedDates.push(date)
  }

  // Filter out those greater than the current financial year end date
  const filteredDates = changedDates.filter((changedDate) => {
    return changedDate < currentFinancialYearEndDate
  })

  // Now work out the earliest end date from those that have changed
  return filteredDates.length > 0 ? new Date(Math.min(...filteredDates)) : null
}

/**
 * Updates the supplementary billing flags for a licence based on the earliest changed date and existing licence details
 *
 * This function determines:
 * - If a pre-sroc flag should be set when the earliest changed date affects bill runs prior to the sroc start date
 *   (1st April 2022) and the licence has pre-sroc charge versions.
 * - If an sroc flag should be set based on the presence of sroc charge versions on the licence.
 * - If a two-part tariff flag should be set based on the presence of two-part tariff charge versions on the licence.
 *
 * For example:
 * - If the licence's end date is changed to 1st January 2019 (pre-sroc), the function sets the pre-sroc flag
 *   because all bill runs since that date are affected. The sroc flag is also set if applicable.
 * - If the change is after the sroc start date (e.g., 1st April 2022), only the sroc or two-part tariff flag is updated
 *   depending on the charge versions present on the licence.
 *
 * If the pre-sroc flag is already set, it is not recalculated.
 *
 * @private
 */
function _updateFlags(earliestChangedDate, existingLicenceDetails, flagForPreSrocSupplementary, result) {
  if (!flagForPreSrocSupplementary) {
    const { pre_sroc_charge_versions: chargeVersions } = existingLicenceDetails

    result.flagForPreSrocSupplementary = chargeVersions && earliestChangedDate < SROC_START_DATE
  }

  result.flagForSrocSupplementary = existingLicenceDetails.sroc_charge_versions
  result.flagForTwoPartTariffSupplementary = existingLicenceDetails.two_part_tariff_charge_versions
}

module.exports = {
  go
}
