'use strict'

/**
 * Determines which flags a licence should have for supplementary billing
 * @module DetermineSupplementaryBillingFlagsService
 */

const DetermineBillingYearsService = require('./determine-billing-years.service.js')
const FetchChargeVersionsService = require('./fetch-charge-versions.service.js')
const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')
const PersistSupplementaryBillingFlagsService = require('./persist-supplementary-billing-flags.service.js')

const APRIL = 3
const SROC = new Date('2022-04-01')

/**
 * Determines and persists the flags for supplementary billing
 *
 * - Fetches the relevant charge versions and licence data
 * - Determines which dates have changed on the licence and which flags should be applied based on the data.
 * - Persists the flags using the `PersistSupplementaryBillingFlagsService`.
 *
 * @param {*} naldLicence - The legacy NALD licence
 * @param {string} wrlsLicenceId - The UUID of the licence being flagged for supplementary billing
 */
async function go (naldLicence, wrlsLicenceId) {
  const { chargeVersions, licence } = await FetchChargeVersionsService.go(wrlsLicenceId)

  if (chargeVersions.length === 0) {
    return
  }

  const datesToProcess = _datesToProcess(licence, naldLicence)

  if (datesToProcess.length === 0) {
    return
  }

  const { preSrocFlag, srocFlag, twoPartTariffFinancialYears } = await _determineSupplementaryFlags(datesToProcess, chargeVersions, licence)

  await PersistSupplementaryBillingFlagsService.go(twoPartTariffFinancialYears, preSrocFlag, srocFlag, wrlsLicenceId)
}

function _datesToProcess (licence, naldLicence) {
  const changedDates = _determineChangedDates(licence, naldLicence)
  const { endDate } = determineCurrentFinancialYear()

  return changedDates.filter((changedDate) => {
    return changedDate < endDate
  })
}

function _dateToFlag (changedDates, naldDate, wrlsDate) {
  const { startDate, endDate } = determineCurrentFinancialYear()
  const sixYearsAgo = new Date(startDate.getFullYear() - 6, APRIL, 1)

  if (naldDate) {
    changedDates.push(naldDate)

    return
  }

  if (wrlsDate > endDate) {
    return
  }

  if (wrlsDate < endDate && wrlsDate > sixYearsAgo) {
    changedDates.push(wrlsDate)

    return
  }

  if (wrlsDate < sixYearsAgo) {
    changedDates.push(sixYearsAgo)
  }
}

function _determineBillingYears (chargeVersions) {
  const financialYearEnds = []

  for (const chargeVersion of chargeVersions) {
    const years = DetermineBillingYearsService.go(chargeVersion.startDate, chargeVersion.endDate)

    financialYearEnds.push(...years)
  }

  return [...new Set(financialYearEnds)]
}

function _determineChangedDates (licence, naldLicence) {
  const { revokedDate, lapsedDate, expiredDate } = naldLicence

  const changedDates = []

  if (revokedDate !== licence[0].revokedDate) {
    _dateToFlag(changedDates, revokedDate, licence[0].revokedDate)
  }

  if (lapsedDate !== licence[0].lapsedDate) {
    _dateToFlag(changedDates, lapsedDate, licence[0].lapsedDated)
  }

  if (expiredDate !== licence[0].expiredDate) {
    _dateToFlag(changedDates, expiredDate, licence[0].expiredDate)
  }

  return changedDates
}

async function _determineSupplementaryFlags (datesToProcess, chargeVersions, licence) {
  const { includeInSrocBilling, includeInPresrocBilling, preSroc } = licence

  const earliestDate = _earliestDate(datesToProcess)
  const { endDate } = determineCurrentFinancialYear()

  const preSrocFlag = _flagPreSrocSupplementary(earliestDate, includeInPresrocBilling, preSroc)
  const srocFlag = _flagSrocSupplementary(chargeVersions, earliestDate, endDate, includeInSrocBilling)
  const twoPartTariffFinancialYears = await _flagTwoPartTariffSupplementary(
    chargeVersions, earliestDate, endDate)

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

  return []
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
