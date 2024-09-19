'use strict'

/**
 * @module TransformLicenceSupplementaryFlagsService
 */

const LicenceSupplementaryYearModel = require('../../../models/licence-supplementary-year.model.js')
const ChargeVersionModel = require('../../../models/charge-version.model.js')
const LicenceModel = require('../../../models/licence.model.js')
const { ref } = require('objection')

const APRIL = 3
const SROC_START_DATE = new Date('2022-04-01')

/**
 * ha
 * @param {*} transformedLicence
 * @param {*} wrlsLicenceId
 * @returns
 */
async function go (transformedLicence, wrlsLicenceId) {
  // temp code
  const lapsedDate = new Date()

  const wrlsLicence = await _fetchWrlsLicenceData(wrlsLicenceId)

  console.log('wrlsLicence : ', wrlsLicence)

  // const dates = _updatedLicenceEndDate(wrlsLicence, transformedLicence)
  const dates = []

  // temp code
  dates.push(lapsedDate)
  console.log('dates :', dates)

  if (dates.length === 0) {
    return
  }

  // If todays date (17th September 2024) then this is 31st March 2025
  const currentFinancialYearEnd = _currentFinancialYearEnd()

  console.log('currentFinancialYearEnd : ', currentFinancialYearEnd)
  const result = {}
  const chargeVersions = await _fetchChargeVersions(wrlsLicence.licenceRef)

  console.log('chargeVersions :', chargeVersions)
  const financialYearEnds = []

  for (const date of dates) {
    // If the date thats changed is greater then the end of the current financial year then return
    if (date > currentFinancialYearEnd) {
      console.log('Returning because the date is greater than the end date of the current year')

      return
    }

    // Loop through the filtered licences charge versions
    for (const chargeVersion of chargeVersions) {
      const twoPartTariffChargeVersion = _twoPartTariffChargeVersion(chargeVersion)

      console.log('twoPartTariffChargeVersion  : ', twoPartTariffChargeVersion)

      // PRE SROC
      if (wrlsLicence.includeInPresrocBilling === 'no' && !result.flagForPreSrocSupplementary) {
        // check if pre sroc needs to be flagged
        if (chargeVersion.startDate < SROC_START_DATE) {
          console.log('Flagging for PRE SROC')
          result.flagForPreSrocSupplementary = true
        }
      }

      // SROC
      if (wrlsLicence.includeInSrocBilling === false && !result.flagForSrocSupplementary) {
        if ((chargeVersion.endDate > SROC_START_DATE || chargeVersion.endDate === null) &&
        !twoPartTariffChargeVersion) {
          console.log('Flagging for SROC')
          result.flagForSrocSupplementary = true
        }
      }

      // TWO-PART TARIFF SROC
      // Dates
      // Charge Version 2022-04-01 - 2024-04-01
      // Revoked Date 2024-04-01
      // Financial Year End 2025-03-31
      // Work out the years affected
      // Fetch any records where the licence might already be flagged for those years
      if (twoPartTariffChargeVersion) {
        chargeVersion.endDate = chargeVersion.endDate === null ? date : chargeVersion.endDate
        let chargeVersionStartYear = chargeVersion.startDate.getFullYear()
        let chargeVersionEndYear = chargeVersion.endDate.getFullYear()

        if (chargeVersion.startDate.getMonth() >= APRIL) {
          // chargeVersionStartYear = 2023
          chargeVersionStartYear++
        }

        if (chargeVersion.endDate.getMonth() >= APRIL) {
          // chargeVersionEndYear = 2025
          chargeVersionEndYear++
        }
        console.log('chargeVersionStartYear : ', chargeVersionStartYear)
        console.log('chargeVersionEndYear :', chargeVersionEndYear)
        for (let year = chargeVersionStartYear; year <= chargeVersionEndYear; year++) {
          const match = await _fetchExistingLicenceSupplementaryYears(wrlsLicence.id, year)

          console.log('match : ', match)
          if (match) {
            continue
          }

          financialYearEnds.push(year)
        }
      }
    }
  }
  // de dup the financialYearEnds
  const twoPartTariffSupplementaryYears = [...new Set(financialYearEnds)]

  console.log('twoPartTariffSupplementaryYears : ', twoPartTariffSupplementaryYears)

  const result1 = {
    flagForPreSrocSupplementary: result.flagForPreSrocSupplementary,
    flagForSrocSupplementary: result.flagForSrocSupplementary,
    flagFor2ptSupplementary: twoPartTariffSupplementaryYears
  }

  console.log('--------------------------------')
  console.log('Result : ', result1)

  return result1
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

function _twoPartTariffChargeVersion (chargeVersion) {
  const { chargeReferences } = chargeVersion
  const twoPartTariffChargeVersion = chargeReferences.some((chargeReference) => {
    console.log('Charge Reference :', chargeReference)

    return chargeReference.s127 === 'true'
  })

  return twoPartTariffChargeVersion
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

function _financialYearSixYearsAgo () {
  const date = new Date()
  let year = date.getFullYear()

  if (date.getMonth() >= APRIL) {
    year++
  }

  const sixYearsAgo = year - 6
  const financialYearSixYearsAgo = new Date(sixYearsAgo, APRIL, 1)

  return financialYearSixYearsAgo
}

async function _fetchChargeVersions (licenceRef) {
  const chargeVersions = await ChargeVersionModel.query()
    .select([
      'id',
      'startDate',
      'endDate'
    ])
    .where('licenceRef', licenceRef)
    .withGraphFetched('chargeReferences')
    .modifyGraph('chargeReferences', (builder) => {
      builder
        .select([
          'id',
          ref('chargeReferences.adjustments:s127').castText().as('s127')
        ])
    })
    .withGraphFetched('chargeReferences.chargeElements')
    .modifyGraph('chargeReferences.chargeElements', (builder) => {
      builder
        .select([
          'id',
          'section127Agreement'
        ])
    })

  const financialYearsSixYearsAgo = _financialYearSixYearsAgo()

  // Filter out any charge versions that are older than the 6 years that we flag for supplementary billing
  const filteredChargeVersions = chargeVersions.filter((chargeVersion) => {
    return chargeVersion.endDate >= financialYearsSixYearsAgo || chargeVersion.endDate === null
  })

  return filteredChargeVersions
}

function _currentFinancialYearEnd () {
  const date = new Date()
  let year = date.getFullYear()

  if (date.getMonth() >= APRIL) {
    year++
  }

  return new Date(year, 2, 31)
}

async function _fetchWrlsLicenceData (id) {
  return LicenceModel.query()
    .findById(id)
    .select([
      'id',
      'licenceRef',
      'includeInPresrocBilling',
      'includeInSrocBilling',
      'revokedDate',
      'lapsedDate',
      'expiredDate'
    ])
}

// NALD Licence : {
//   expiredDate: null,
//   lapsedDate: null,
//   licenceRef: '1/21/00/004',
//   licenceVersions: [],
//   regionId: 'ba2d2a46-1831-4c25-b4bb-14cbcb31b0d9',
//   regions: {
//     historicalAreaCode: 'NAREA',
//     regionalChargeArea: 'Northumbria',
//     standardUnitChargeCode: 'NORTH',
//     localEnvironmentAgencyPlanCode: 'CHEVI'
//   },
//   revokedDate: null,
//   startDate: 1966-12-14T00:00:00.000Z,
//   waterUndertaker: false
// }

// WRLS Licence {
//  id: 'e55e6366-b3f4-4d76-b3eb-387f8889e2dc',
//  includeInPresrocBilling: 'no',
//  includeInSrocBilling: false,
//  revokedDate: null,
//  lapsedDate: null,
//  expiredDate: null
// }

// expiredDate: 1st April 2030
// work out which dates have changed
// with the changed date/dates work out if its a future date from the financial year end 17 September 2024, the
// financial year end 31st March 2025
// is the licence already flagged for
// includeInPresrocBilling: 'yes' - has a date changed/ does it have any pre sroc charge versions
// includeInSrocBilling: true, - has the date changed/ does it have any sroc non two-part tariff charge versions
// licenceSupplementaryYears - has the date changed/ does it have any sroc two-part tariff charge versions, yes?
// Work out the years

// Charge Versions
// licenceChargeVersions [
//   ChargeVersionModel {
//     id: '7652b246-8a21-45f9-ac1c-72177b6628f5',
//     startDate: 2009-08-10T00:00:00.000Z,
//     endDate: null
//   },
//   ChargeVersionModel {
//     id: '99784343-faca-48ac-84d2-c972cc705f9e',
//     startDate: 2006-04-01T00:00:00.000Z,
//     endDate: 2009-08-09T00:00:00.000Z
//   },
//   ChargeVersionModel {
//     id: '02c1adaf-3a56-449c-ae89-5a55786ad2a3',
//     startDate: 1984-01-01T00:00:00.000Z,
//     endDate: 2006-03-31T00:00:00.000Z
//   },
//   ChargeVersionModel {
//     id: '83a410e3-72b3-43fd-b419-3879f52bee5c',
//     startDate: 1966-12-14T00:00:00.000Z,
//     endDate: 1983-12-31T00:00:00.000Z
//   }
// ]
//
// 2024-2025 - Current financial year
// 2023-2024
// 2022-2023
// 2021-2022
// 2020-2021
// 2019-2020
// Date I want is 1st April 2019

module.exports = {
  go
}
