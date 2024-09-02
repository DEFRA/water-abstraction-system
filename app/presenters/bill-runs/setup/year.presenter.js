'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/year` page
 * @module YearPresenter
 */

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/year` page
 *
 * @param {module:LicenceSupplementaryYearModel} licenceSupplementaryYears - An array of distinct `financialYearEnd`
 * years flagged for supplementary billing for the selected region and bill run type
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {object} - The data formatted for the view template
 */
function go (licenceSupplementaryYears, session) {
  const selectedYear = session.year ? session.year : null

  let financialYearsData = []

  // Currently for Two-part tariff Annual the financial years are hardcoded. This is because the Annual billing process
  // has not been available to be run for several years. Once caught up the annual two-part tariff will only be run for
  // a single year and this temporary code can be removed.
  if (session.type === 'two_part_tariff') {
    financialYearsData = _tptAnnualFinancialYearsData(selectedYear)
  } else {
    financialYearsData = _financialYearsData(licenceSupplementaryYears, selectedYear)
  }

  return {
    financialYearsData,
    sessionId: session.id,
    selectedYear
  }
}

function _financialYearsData (licenceSupplementaryYears, selectedYear) {
  const financialYearsData = []

  if (licenceSupplementaryYears.length > 0) {
    licenceSupplementaryYears.forEach((licenceSupplementaryYear) => {
      const { financialYearEnd } = licenceSupplementaryYear

      financialYearsData.push({
        text: `${financialYearEnd - 1} to ${financialYearEnd}`,
        value: financialYearEnd.toString(),
        checked: selectedYear === financialYearEnd.toString()
      })
    })
  }

  return financialYearsData
}

function _tptAnnualFinancialYearsData (selectedYear) {
  return [
    { text: '2023 to 2024', value: '2024', checked: selectedYear === '2024' },
    { text: '2022 to 2023', value: '2023', checked: selectedYear === '2023' },
    { text: '2021 to 2022', value: '2022', checked: selectedYear === '2022' },
    { text: '2020 to 2021', value: '2021', checked: selectedYear === '2021' }
  ]
}

module.exports = {
  go
}
