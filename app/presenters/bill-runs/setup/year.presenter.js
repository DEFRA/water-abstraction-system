'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/year` page
 * @module RegionPresenter
 */

const LicenceSupplementaryYearModel = require('../../../models/licence-supplementary-year.model.js')

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/year` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} - The data formatted for the view template
 */
async function go (session) {
  const selectedYear = session.year ? session.year : null

  let financialYearsData = []

  if (session.type === 'two_part_tariff') {
    financialYearsData = _annualFinancialYearsData(selectedYear)
  }

  if (session.type === 'two_part_supplementary') {
    financialYearsData = await _supplementaryFinancialYearsData(session.region, selectedYear)
  }

  return {
    financialYearsData,
    sessionId: session.id,
    selectedYear
  }
}

function _annualFinancialYearsData (selectedYear) {
  return [
    { text: '2023 to 2024', value: 2024, checked: selectedYear === '2024' },
    { text: '2022 to 2023', value: 2023, checked: selectedYear === '2023' },
    { text: '2021 to 2022', value: 2022, checked: selectedYear === '2022' },
    { text: '2020 to 2021', value: 2021, checked: selectedYear === '2021' }
  ]
}

async function _supplementaryFinancialYearsData (regionId, selectedYear) {
  const supplementaryFinancialYearsData = []
  const tptSupplementaryYears = await _tptSupplementaryYears(regionId)

  if (tptSupplementaryYears.length > 0) {
    tptSupplementaryYears.forEach((tptSupplementaryYear) => {
      supplementaryFinancialYearsData.push({
        text: `${tptSupplementaryYear.financialYearEnd - 1} to ${tptSupplementaryYear.financialYearEnd}`,
        value: tptSupplementaryYear.financialYearEnd,
        checked: selectedYear === tptSupplementaryYear.financialYearEnd.toString()
      })
    })
  }

  return supplementaryFinancialYearsData
}

async function _tptSupplementaryYears (regionId) {
  return LicenceSupplementaryYearModel.query()
    .distinct('financialYearEnd')
    .innerJoinRelated('licence')
    .where('twoPartTariff', true)
    .where('regionId', regionId)
    .orderBy('financialYearEnd', 'desc')
}

module.exports = {
  go
}
