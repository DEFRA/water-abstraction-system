'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/year` page
 * @module RegionPresenter
 */

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/year` page
 *
 * @param {module:SessionModel} session - The session instance to format
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  const selectedYear = session.year ? session.year : null

  let financialYearsData = []

  if (session.type === 'two_part_tariff') {
    financialYearsData = _annualFinancialYearsData(selectedYear)
  }

  if (session.type === 'two_part_supplementary') {
    financialYearsData = _supplementaryFinancialYearsData(selectedYear)
  }

  return {
    financialYearsData,
    sessionId: session.id,
    selectedYear: session.year ? session.year : null
  }
}

function _annualFinancialYearsData (selectedYear) {
  return [
    {
      text: '2023 to 2024',
      value: '2024',
      checked: selectedYear === '2024'
    },
    {
      text: '2022 to 2023',
      value: '2023',
      checked: selectedYear === '2023'
    },
    {
      text: '2021 to 2022',
      value: '2022',
      checked: selectedYear === '2022'
    },
    {
      text: '2020 to 2021',
      value: '2021',
      checked: selectedYear === '2021'
    }
  ]
}

function _supplementaryFinancialYearsData (selectedYear) {
  return [
    {
      text: '2023 to 2024',
      value: '2024',
      checked: selectedYear === '2024'
    },
    {
      text: '2022 to 2023',
      value: '2023',
      checked: selectedYear === '2023'
    },
    {
      text: '2021 to 2022',
      value: '2022',
      checked: selectedYear === '2022'
    },
    {
      text: '2020 to 2021',
      value: '2021',
      checked: selectedYear === '2021'
    }
  ]
}

module.exports = {
  go
}
