'use strict'

/**
 * @module FlagForSupplementaryBillingService
 */

const DetermineSupplementaryBillingFlagsService = require('../licences/supplementary/determine-supplementary-billing-flags.service.js')
const { determineCurrentFinancialYear } = require('../../lib/general.lib.js')

const APRIL = 3

/**
 * I am a comment
 * @param {*} transformedLicence
 * @param {*} wrlsLicenceId
 */
async function go (transformedLicence, wrlsLicenceId) {
  // const naldEndDates = [
  //   { expiredDate: transformedLicence.expiredDate },
  //   { revokedDate: transformedLicence.revokedDate },
  //   { lapsedDate: transformedLicence.lapsedDate }
  // ]

  // _filterNaldEndDates(naldEndDates)
  const naldEndDates = _getDatesInRange(transformedLicence)

  // If our dates object is empty it means there are no dates that we can flag for supplementary billing
  if (Object.keys(naldEndDates).length === 0) {
    return
  }

  // if (naldEndDates.length === 0) {
  //   // If there are no end dates that are not null then we can return as there is nothing to flag
  //   return
  // }

  await DetermineSupplementaryBillingFlagsService.go(wrlsLicenceId, naldEndDates)
}

function _getDatesInRange (transformedLicence) {
  const { expiredDate, lapsedDate, revokedDate } = transformedLicence

  const endDates = {}
  const { startDate, endDate } = determineCurrentFinancialYear()
  const sixYearsAgo = new Date(startDate.getFullYear() - 6, APRIL, 1)

  if (expiredDate !== null && expiredDate > sixYearsAgo && expiredDate < endDate) {
    endDates.expiredDate = expiredDate
  }

  if (lapsedDate !== null && lapsedDate > sixYearsAgo && lapsedDate < endDate) {
    endDates.expiredDate = expiredDate
  }

  if (revokedDate !== null && revokedDate > sixYearsAgo && revokedDate < endDate) {
    endDates.expiredDate = expiredDate
  }

  return endDates
}

function _filterNaldEndDates (naldEndDates) {
  const financialYear = determineCurrentFinancialYear()
  const sixYearsAgo = new Date(financialYear.startDate.getFullYear() - 6, APRIL, 1)

  // We want to filter the naldEndDates to only contain dates that are within the date range we can bill for.
  // We remove null values as this means there is no change in the end dates.
  // We remove values greater than the current financial year end, as this changes doesn't impact an existing bill run
  // We remove values older than 6 years as we can only bill up to 6 years ago. Anything after that can not be re billed
  naldEndDates.filter((endDate) => {
    // Since naldEndDates is an array of objects, we need to access the value to compare it to our date range
    const dateValue = Object.values(endDate)[0]

    return dateValue !== null && dateValue > sixYearsAgo && dateValue < financialYear.endDate
  })
}

module.exports = {
  go
}
