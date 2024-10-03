'use strict'

/**
 * Determines which flags a licence should have for supplementary billing
 * @module DetermineSupplementaryBillingFlagsService
 */

const DetermineBillingYearsService = require('./determine-billing-years.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')
const PersistSupplementaryBillingFlagsService = require('./persist-supplementary-billing-flags.service.js')

const SROC = new Date('2022-04-01')

/**
 * Determines and persists the flags for supplementary billing
 *
 * - Fetches the relevant charge versions and changed dates for the licence.
 * - Determines which flags should be applied based on the data.
 * - Persists the flags using the `PersistSupplementaryBillingFlagsService`.
 *
 * @param {*} naldLicence - The legacy NALD licence
 * @param {string} wrlsLicenceId - The UUID of the licence being flagged for supplementary billing
 */
async function go (naldLicence, wrlsLicenceId) {
  const { chargeVersions, changedDates, licence } = await FetchChargeVersionsService.go(naldLicence, wrlsLicenceId)

  const { preSrocFlag, srocFlag, twoPartTariffFinancialYears } = await _determineSupplementaryFlags(
    changedDates, chargeVersions, licence, wrlsLicenceId)

  await PersistSupplementaryBillingFlagsService.go(twoPartTariffFinancialYears, preSrocFlag, srocFlag, wrlsLicenceId)
}

function _determineBillingYears (chargeVersions) {
  const financialYearEnds = []

  for (const chargeVersion of chargeVersions) {
    const years = DetermineBillingYearsService.go(chargeVersion.startDate, chargeVersion.endDate)

    financialYearEnds.push(...years)
  }

  return [...new Set(financialYearEnds)]
}

async function _determineSupplementaryFlags (changedDates, chargeVersions, licence, wrlsLicenceId) {
  const { includeInSrocBilling, includeInPresrocBilling, preSroc } = licence

  const earliestDate = _earliestDate(changedDates)
  const { endDate } = determineCurrentFinancialYear()

  const preSrocFlag = _flagPreSrocSupplementary(earliestDate, includeInPresrocBilling, preSroc)
  const srocFlag = _flagSrocSupplementary(chargeVersions, earliestDate, endDate, includeInSrocBilling)
  const twoPartTariffFinancialYears = await _flagTwoPartTariffSupplementary(chargeVersions, earliestDate, endDate, wrlsLicenceId)

  return { preSrocFlag, srocFlag, twoPartTariffFinancialYears }
}

function _earliestDate (changedDates) {
  const datesAsTimeStamps = []

  for (const date of changedDates) {
    datesAsTimeStamps.push(date.getTime())
  }

  const minTimeStamp = Math.min(...datesAsTimeStamps)

  return new Date(minTimeStamp)
}

async function _flagTwoPartTariffSupplementary (chargeVersions, earliestDate, endDate) {
  const srocTwoPartTariffChargeVersions = chargeVersions.filter((chargeVersion) => {
    return chargeVersion.twoPartTariff
  })

  if (earliestDate < endDate && srocTwoPartTariffChargeVersions.length > 0) {
    return _determineBillingYears(srocTwoPartTariffChargeVersions)
  }
}

function _flagSrocSupplementary (chargeVersions, earliestDate, endDate, includeInSrocBilling) {
  if (includeInSrocBilling === true) {
    return true
  }

  const srocChargeVersions = chargeVersions.some((chargeVersion) => {
    return chargeVersion.twoPartTariff === null
  })

  return earliestDate > SROC && earliestDate < endDate && srocChargeVersions
}

function _flagPreSrocSupplementary (earliestDate, includeInPresrocBilling, preSroc) {
  const preSrocFlag = includeInPresrocBilling === 'yes' || (earliestDate < SROC && preSroc > 0)

  return preSrocFlag ? 'yes' : 'no'
}

module.exports = {
  go
}
