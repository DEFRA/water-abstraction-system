'use strict'

/**
 * Processes a licence that has been imported with at least one changed 'end' date (expired, lapsed, or revoked)
 * @module ProcessImportedLicenceService
 */

const DetermineBillingYearsService = require('./determine-billing-years.service.js')
const FetchExistingLicenceDetailsService = require('./fetch-existing-licence-details.service.js')
const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')
const PersistSupplementaryBillingFlagsService = require('./persist-supplementary-billing-flags.service.js')

const SROC_START_DATE = new Date('2022-04-01')

/**
 * Processes a licence that has been imported with at least one changed 'end' date (expired, lapsed, or revoked)
 *
 * @param {object} importedLicence - Object representing the updated licence being imported
 * @param {string} licenceId - The UUID of the licence being imported
 *
 * @returns {Promise} A promise is returned but it does not resolve to anything we expect the caller to use
 */
async function go (importedLicence, licenceId) {
  const existingLicenceDetails = await FetchExistingLicenceDetailsService.go(licenceId)
  const earliestChangedDate = _earliestChangedDate(importedLicence, existingLicenceDetails)

  // If not set it means none of the dates changed were before the current financial year end so there is no reason
  // to change anything on the flags
  if (!earliestChangedDate) {
    return
  }

  const flagForPreSrocSupplementary = _flagForPresrocSupplementary(existingLicenceDetails, earliestChangedDate)
  const flagForSrocSupplementary = _flagForSrocSupplementary(existingLicenceDetails)
  const twoPartTariffBillingYears = _flagForTwoPartTariffSupplementary(existingLicenceDetails, earliestChangedDate)

  await PersistSupplementaryBillingFlagsService.go(
    twoPartTariffBillingYears,
    flagForPreSrocSupplementary,
    flagForSrocSupplementary,
    licenceId
  )
}

function _earliestChangedDate (importedLicence, existingLicenceDetails) {
  const { endDate: currentFinancialYearEndDate } = determineCurrentFinancialYear()
  const changedDates = []

  let date

  // NOTE: Because checking if dates are equal does not give the expected result in JavaScript (it sees 2 different
  // objects even if they represent the same date and time) we convert the date object to strings allowing us to compare
  // the two
  if (String(importedLicence.expiredDate) !== String(existingLicenceDetails.expired_date)) {
    date = importedLicence.expiredDate ?? existingLicenceDetails.expired_date
    changedDates.push(date.getTime())
  }

  if (String(importedLicence.lapsedDate) !== String(existingLicenceDetails.lapsed_date)) {
    date = importedLicence.lapsedDate ?? existingLicenceDetails.lapsed_date
    changedDates.push(date.getTime())
  }

  if (String(importedLicence.revokedDate) !== String(existingLicenceDetails.revoked_date)) {
    date = importedLicence.revokedDate ?? existingLicenceDetails.revoked_date
    changedDates.push(date.getTime())
  }

  // Filter out those greater than the current financial year end date
  const filteredDates = changedDates.filter((changedDate) => {
    return (changedDate < currentFinancialYearEndDate.getTime())
  })

  if (filteredDates.length === 0) {
    return null
  }

  // Now work out the earliest end date from those that have changed
  return new Date(Math.min(...filteredDates))
}

function _flagForPresrocSupplementary (existingLicenceDetails, earliestChangedDate) {
  const { flagged_for_presroc: flagged, pre_sroc_charge_versions: chargeVersions } = existingLicenceDetails

  // If the licence has no presroc charge versions return false. We check this before the existing flag, because this
  // is an opportunity to remove the PRESROC supplementary billing flag from a licence that won't ever be picked up by
  // the PRESROC billing engine (so the flag will never get removed)
  if (!chargeVersions) {
    return false
  }

  // If it is already flagged then we don't want to change the flag so return true
  if (flagged) {
    return true
  }

  // Else return the result of checking if the earliest changed date was before PRESROC billing regime ended
  return earliestChangedDate < SROC_START_DATE
}

function _flagForSrocSupplementary (existingLicenceDetails) {
  const { sroc_charge_versions: chargeVersions } = existingLicenceDetails

  // If the licence has no sroc charge versions return false. We check this before the existing flag, because this
  // is an opportunity to remove the SROC supplementary billing flag from a licence that won't ever be picked up by
  // the SROC billing engine (so the flag will never get removed)

  return !!chargeVersions
}

function _flagForTwoPartTariffSupplementary (existingLicenceDetails, earliestChangedDate) {
  const { two_part_tariff_charge_versions: chargeVersions } = existingLicenceDetails
  const billingYears = []

  // If the licence has no 2PT charge versions return the empty billing years
  if (!chargeVersions) {
    return billingYears
  }

  // If the earliest date is before the SROC charging scheme started default to the SROC START DATE
  const startDate = earliestChangedDate < SROC_START_DATE ? SROC_START_DATE : earliestChangedDate
  const { endDate } = determineCurrentFinancialYear()

  return DetermineBillingYearsService.go(startDate, endDate)
}

module.exports = {
  go
}
