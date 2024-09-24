'use strict'

/**
 * Determines if a licence should be flagged for supplementary billing
 * @module FlagForSupplementaryBillingService
 */

const LicenceSupplementaryYearModel = require('../../models/licence-supplementary-year.model.js')

const APRIL = 3
const MARCH = 2
const MONTH_END = 31
const SIX_YEARS = 6
const SROC_START_DATE = new Date('2022-04-01')

/**
 * Determines if a licence should be flagged for supplementary billing.
 *
 * This service is responsible for determining whether a licence imported from NALD should be flagged for
 * supplementary billing. It compares the licences end dates (such as lapsed, revoked or expired dates) between WRLS
 * and the transformed data, and flags the licence for inclusion in pre-sroc, sroc or sroc two-part tariff billing if
 * necessary.
 * @param {object} transformedLicence - the legacy NALD licence
 * @param {object} wrlsLicence - the WRLS licence data
 */
async function go (transformedLicence, wrlsLicence) {
  const { chargeVersions, id: licenceId } = wrlsLicence

  const result = {
    includeInPresrocBilling: wrlsLicence.includeInPresrocBilling,
    includeInSrocBilling: wrlsLicence.includeInSrocBilling,
    licenceSupplementaryYears: []
  }

  const dates = _getLicenceEndDates(wrlsLicence, transformedLicence)

  if (dates.length === 0) {
    _updateResult(transformedLicence, result)
  }

  const financialYearEnds = []

  await _checkLicenceEndDates(dates, chargeVersions, financialYearEnds, result, licenceId)

  _updateResult(transformedLicence, result)
}

async function _checkChargeVersions (chargeVersions, date, financialYearEnds, result, licenceId) {
  for (const chargeVersion of chargeVersions) {
    const twoPartTariff = _isTwoPartTariffChargeVersion(chargeVersion)

    _flagForPreSrocSupplementary(chargeVersion, result)
    _flagForSrocSupplementary(chargeVersion, result, twoPartTariff)

    await _flagForTwoPartTariffSupplementary(chargeVersion, date, financialYearEnds, twoPartTariff, licenceId)
  }
}

function _checkEndDate (wrlsLicence, transformedLicence, key, dates) {
  const licenceDate = wrlsLicence[key]
  const transformedDate = transformedLicence[key]

  if (transformedDate === null || transformedDate <= _financialYearSixYearsAgo()) {
    return
  }

  if (
    licenceDate === null ||
    licenceDate.getFullYear() !== transformedDate.getFullYear() ||
    licenceDate.getMonth() !== transformedDate.getMonth() ||
    licenceDate.getDate() !== transformedDate.getDate()
  ) {
    dates.push(transformedDate)
  }
}

async function _checkLicenceEndDates (dates, chargeVersions, financialYearEnds, result, licenceId) {
  for (const date of dates) {
    if (date > _currentFinancialYearEndDate()) {
      return
    }

    await _checkChargeVersions(chargeVersions, date, financialYearEnds, result, licenceId)
  }

  result.licenceSupplementaryYears = _licenceSupplementaryYears(financialYearEnds, licenceId)
}

function _currentFinancialYearEndDate () {
  const financialYearEnd = _getFinancialYear(new Date())

  return new Date(financialYearEnd, MARCH, MONTH_END)
}

async function _fetchExistingLicenceSupplementaryYears (licenceId, financialYearEnd) {
  return LicenceSupplementaryYearModel.query()
    .select('id')
    .where('licenceId', licenceId)
    .where('financialYearEnd', financialYearEnd)
    .where('twoPartTariff', true)
    .where('billRunId', null)
    .limit(1)
    .first()
}

function _financialYearSixYearsAgo () {
  const date = new Date()
  let year = date.getFullYear()

  if (date.getMonth() >= APRIL) {
    year++
  }

  const sixYearsAgo = year - SIX_YEARS
  const financialYearSixYearsAgo = new Date(sixYearsAgo, APRIL, 1)

  return financialYearSixYearsAgo
}

/**
 * If a licence is already flagged for the pre sroc supplementary bill run then we ignore flagging it again
 * If the charge version start date is before the start of the sroc period (1st April 2022), then we flag it for pre
 * sroc supplementary billing
 *
 * @private
 */
function _flagForPreSrocSupplementary (chargeVersion, result) {
  if (chargeVersion.startDate < SROC_START_DATE) {
    result.includeInPresrocBilling = 'yes'
  }
}

/**
 * If a licence is already flagged for the sroc supplementary bill run then we ignore flagging it again
 * If the charge version end date is null or after the start of the sroc period (1st April 2022) and the charge version
 * being checked is not a two-part tariff one, then we flag it for sroc supplementary billing
 *
 * @private
 */
function _flagForSrocSupplementary (chargeVersion, result, twoPartTariff) {
  if ((chargeVersion.endDate > SROC_START_DATE || chargeVersion.endDate === null) && !twoPartTariff) {
    result.includeInSrocBilling = true
  }
}

/**
 * Flagging a licence for two-part tariff supplementary billing means we need to work out which years have been affected
 * by the licence end date.
 * Firstly if the charge version we are checking is not two-part tariff then we don't want to flag it.
 * Next we need to populate the charge version end date if it doesn't exist.
 * Using our charge version start and end dates we now need to work out which financial years are impacted.
 * If a charge version started in April for example (1st April 2022), the financial year end that is impacted is not
 * 2022 but rather 2023, because the financial year runs 1st April to 31st March.
 * Once we have the year range impacted we loop through the years and check if there is already a record on the licence
 * supplementary years table (flagging that year already on the licence).
 * If theres a match then we don't want to add a duplicate record so we continue. If there is no match then we add this
 * year to our financialYearEnds.
 *
 * @private
 */
async function _flagForTwoPartTariffSupplementary (chargeVersion, date, financialYearEnds, twoPartTariff, licenceId) {
  if (!twoPartTariff) {
    return
  }

  chargeVersion.endDate = chargeVersion.endDate === null ? date : chargeVersion.endDate
  const chargeVersionStartYear = _getFinancialYear(chargeVersion.startDate)
  const chargeVersionEndYear = _getFinancialYear(chargeVersion.endDate)

  for (let year = chargeVersionStartYear; year <= chargeVersionEndYear; year++) {
    const match = await _fetchExistingLicenceSupplementaryYears(licenceId, year)

    if (match) {
      continue
    }

    financialYearEnds.push(year)
  }
}

/**
 * This function calculates the financial year end for a given date
 * @private
 */
function _getFinancialYear (date) {
  let year = date.getFullYear()

  if (date.getMonth() >= APRIL) {
    year++
  }

  return year
}

/**
 * Compares the end dates for the nald licence being imported and the current records that we hold for that licence in
 * the WRLS database. If any of the dates are different it means we need to go through the process of flagging the
 * licence for supplementary billing
 * @private
 */
function _getLicenceEndDates (wrlsLicence, transformedLicence) {
  const dates = []
  const endDateTypes = ['revokedDate', 'lapsedDate', 'expiredDate']

  endDateTypes.forEach((endDateType) => {
    _checkEndDate(wrlsLicence, transformedLicence, endDateType, dates)
  })

  return dates
}

function _isTwoPartTariffChargeVersion (chargeVersion) {
  const { chargeReferences } = chargeVersion

  const twoPartTariffChargeVersion = chargeReferences.some((chargeReference) => {
    const chargeElementTwoPartTariff = chargeReference.chargeElements.some((chargeElement) => {
      return chargeElement.section127Agreement
    })

    return chargeReference.s127 === 'true' && chargeElementTwoPartTariff
  })

  return twoPartTariffChargeVersion
}

function _licenceSupplementaryYears (financialYearEnds, id) {
  const uniqueYears = [...new Set(financialYearEnds)]

  return uniqueYears.map((year) => {
    return {
      financialYearEnd: year,
      twoPartTariff: true,
      licenceId: id
    }
  })
}

function _updateResult (transformedLicence, result) {
  transformedLicence.includeInPresrocBilling = result.includeInPresrocBilling
  transformedLicence.includeInSrocBilling = result.includeInSrocBilling
  transformedLicence.licenceSupplementaryYears = result.licenceSupplementaryYears
}

module.exports = {
  go
}
