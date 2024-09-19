'use strict'

/**
 * @module FlagForSupplementaryBillingPresenter
 */

const APRIL = 3
const SROC_START_DATE = new Date('2022-04-01')

const LicenceSupplementaryYearModel = require('../../../models/licence-supplementary-year.model.js')

// Consider new licence

/**
 * hah
 * @param {*} transformedLicence
 * @param {*} wrlsLicence
 */
async function go (transformedLicence, wrlsLicence) {
  const { chargeVersions } = wrlsLicence

  const dates = _updatedLicenceEndDate(wrlsLicence, transformedLicence)

  // If todays date is (17th September 2024) then this is 31st March 2025
  const currentFinancialYearEnd = _currentFinancialYearEnd()
  const financialYearEnds = []

  const result = {
    includeInPresrocBilling: wrlsLicence.includeInPresrocBilling,
    includeInSrocBilling: wrlsLicence.includeInSrocBilling,
    licenceSupplementaryYears: []
  }

  if (dates.length === 0) {
    return result
  }

  for (const date of dates) {
    // If the licence end date is greater then the end of the current financial period then no flags need to be set
    if (date > currentFinancialYearEnd) {
      return
    }

    for (const chargeVersion of chargeVersions) {
      const twoPartTariffChargeVersion = _twoPartTariffChargeVersion(chargeVersion)

      _flagForPreSrocSupplementary(chargeVersion, result)
      _flagForSrocSupplementary(chargeVersion, result, twoPartTariffChargeVersion)

      await _flagForTwoPartTariffSupplementary(
        chargeVersion,
        date,
        financialYearEnds,
        twoPartTariffChargeVersion,
        wrlsLicence.id)
    }
  }
  result.licenceSupplementaryYears.push(...new Set(financialYearEnds))

  const licenceSupplementaryYearsToPersist = result.licenceSupplementaryYears.map((year) => {
    return {
      financialYearEnd: year,
      twoPartTariff: true,
      licenceId: wrlsLicence.id
    }
  })

  transformedLicence.includeInPresrocBilling = result.includeInPresrocBilling
  transformedLicence.includeInSrocBilling = result.includeInSrocBilling
  transformedLicence.licenceSupplementaryYears = licenceSupplementaryYearsToPersist

  console.log('Result :', transformedLicence)
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

async function _flagForTwoPartTariffSupplementary (
  chargeVersion,
  date,
  financialYearEnds,
  twoPartTariffChargeVersion,
  wrlsLicenceId
) {
  if (twoPartTariffChargeVersion) {
    chargeVersion.endDate = chargeVersion.endDate === null ? date : chargeVersion.endDate
    let chargeVersionStartYear = chargeVersion.startDate.getFullYear()
    let chargeVersionEndYear = chargeVersion.endDate.getFullYear()

    if (chargeVersion.startDate.getMonth() >= APRIL) {
      chargeVersionStartYear++
    }

    if (chargeVersion.endDate.getMonth() >= APRIL) {
      chargeVersionEndYear++
    }

    for (let year = chargeVersionStartYear; year <= chargeVersionEndYear; year++) {
      const match = await _fetchExistingLicenceSupplementaryYears(wrlsLicenceId, year)

      if (match) {
        continue
      }

      financialYearEnds.push(year)
    }
  }
}

function _flagForSrocSupplementary (chargeVersion, result, twoPartTariffChargeVersion) {
  if (result.flagForSrocSupplementary === false) {
    if ((chargeVersion.endDate > SROC_START_DATE || chargeVersion.endDate === null) &&
    !twoPartTariffChargeVersion) {
      result.includeInSrocBilling = true
    }
  } else {
    result.includeInSrocBilling = true
  }
}

function _flagForPreSrocSupplementary (chargeVersion, result) {
  if (result.includeInPresrocBilling === 'no') {
    if (chargeVersion.startDate < SROC_START_DATE) {
      result.includeInPresrocBilling = 'yes'
    }
  } else {
    result.includeInPresrocBilling = 'yes'
  }
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

function _currentFinancialYearEnd () {
  const date = new Date()
  let year = date.getFullYear()

  if (date.getMonth() >= APRIL) {
    year++
  }

  return new Date(year, 2, 31)
}

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
