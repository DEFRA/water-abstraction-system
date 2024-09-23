'use strict'

/**
 * @module FlagForSupplementaryBillingPresenter
 */

const APRIL = 3
const SROC_START_DATE = new Date('2022-04-01')

const LicenceSupplementaryYearModel = require('../../models/licence-supplementary-year.model.js')

// Consider new licence

/**
 * hah
 * @param {*} transformedLicence
 * @param {*} wrlsLicence
 */
async function go (transformedLicence, wrlsLicence) {
  const { chargeVersions, id: licenceId } = wrlsLicence

  const result = {
    includeInPresrocBilling: wrlsLicence.includeInPresrocBilling,
    includeInSrocBilling: wrlsLicence.includeInSrocBilling,
    licenceSupplementaryYears: []
  }

  const dates = _updatedLicenceEndDate(wrlsLicence, transformedLicence)

  if (dates.length === 0) {
    console.log('Result :', result)
    transformedLicence.includeInPresrocBilling = result.includeInPresrocBilling
    transformedLicence.includeInSrocBilling = result.includeInSrocBilling
    transformedLicence.licenceSupplementaryYears = []

    return
  }

  const financialYearEnds = []

  await _compareLicenceEndDates(dates, chargeVersions, financialYearEnds, result, licenceId)
  const licenceSupplementaryYearsToPersist = _licenceSupplementaryYearsToPersist(financialYearEnds, wrlsLicence.id)

  transformedLicence.includeInPresrocBilling = result.includeInPresrocBilling
  transformedLicence.includeInSrocBilling = result.includeInSrocBilling
  transformedLicence.licenceSupplementaryYears = licenceSupplementaryYearsToPersist
}

async function _compareChargeVersions (chargeVersions, date, financialYearEnds, result, licenceId) {
  for (const chargeVersion of chargeVersions) {
    const twoPartTariff = _twoPartTariffChargeVersion(chargeVersion)

    console.log('twoPartTariff :', twoPartTariff)
    _flagForPreSrocSupplementary(chargeVersion, result)
    _flagForSrocSupplementary(chargeVersion, result, twoPartTariff)

    await _flagForTwoPartTariffSupplementary(chargeVersion, date, financialYearEnds, twoPartTariff, licenceId)
  }
}

async function _compareLicenceEndDates (dates, chargeVersions, financialYearEnds, result, licenceId) {
  for (const date of dates) {
    if (date > _currentFinancialYearEnd()) {
      return
    }

    await _compareChargeVersions(chargeVersions, date, financialYearEnds, result, licenceId)
  }
}

function _currentFinancialYearEnd () {
  const financialYearEnd = _getFinancialYearEnd(new Date())

  return new Date(financialYearEnd, 2, 31)
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

/**
 * If a licence is already flagged for the pre sroc supplementary bill run then we ignore flagging it again
 * If the charge version start date is before the start of the sroc period (1st April 2022), then we flag it for pre
 * sroc supplementary billing
 *
 * @private
 */
function _flagForPreSrocSupplementary (chargeVersion, result) {
  if (result.includeInPresrocBilling === 'yes') {
    return
  }

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
  if (result.flagForSrocSupplementary === true) {
    return
  }

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
  const chargeVersionStartYear = _getFinancialYearEnd(chargeVersion.startDate)
  const chargeVersionEndYear = _getFinancialYearEnd(chargeVersion.endDate)

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
function _getFinancialYearEnd (date) {
  let year = date.getFullYear()

  if (date.getMonth() >= APRIL) {
    year++
  }

  return year
}

function _licenceSupplementaryYearsToPersist (financialYearEnds, id) {
  const uniqueYears = [...new Set(financialYearEnds)]

  return uniqueYears.map((year) => {
    return {
      financialYearEnd: year,
      twoPartTariff: true,
      licenceId: id
    }
  })
}

function _twoPartTariffChargeVersion (chargeVersion) {
  const { chargeReferences } = chargeVersion

  const twoPartTariffChargeVersion = chargeReferences.some((chargeReference) => {
    const chargeElementTwoPartTariff = chargeReference.chargeElements.some((chargeElement) => {
      return chargeElement.section127Agreement
    })

    return chargeReference.s127 === 'true' && chargeElementTwoPartTariff
  })

  return twoPartTariffChargeVersion
}

/**
 * Compares the end dates for the nald licence being imported and the current records that we hold for that licence in
 * the WRLS database. If any of the dates are different it means we need to go through the process of flagging the
 * licence for supplementary billing
 * @private
 */
function _updatedLicenceEndDate (wrlsLicence, transformedLicence) {
  const dates = []

  if (wrlsLicence.revokedDate !== transformedLicence.revokedDate) {
    dates.push(transformedLicence.revokedDate)
  }

  if (wrlsLicence.lapsedDate !== transformedLicence.lapsedDate) {
    dates.push(transformedLicence.lapsedDate)
  }

  if (wrlsLicence.expiredDate !== transformedLicence.expiredDate) {
    dates.push(transformedLicence.expiredDate)
  }

  return dates
}

module.exports = {
  go
}
