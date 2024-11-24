'use strict'

/**
 * Formats the last 6 financial years ready for presenting in the mark for supplementary billing page
 * @module MarkForSupplementaryBillingPresenter
 */

const { formatFinancialYear } = require('../../base.presenter.js')

const APRIL = 3
const LAST_PRE_SROC_FINANCIAL_YEAR_END = 2022
const PREVIOUS_SIX_YEARS = 6

/**
 * Formats data for the `/licences/{licenceId}/mark-for-supplementary-billing` page
 *
 * @param {module:LicenceModel} licence - The licence being marked for supplementary billing
 *
 * @returns {object} - The data formatted for the view template
 */
function go(licence) {
  return {
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    financialYears: _yearsToDisplay()
  }
}

/**
 * Determines the current financial year end based on the current date.
 * The financial year end is the end of March, so if the current month is April or later the end of the financial year
 * is the next calendar year. Otherwise it is the current year.
 */
function _determineCurrentFinancialYearEnd() {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  const currentFinancialYearEnd = currentMonth >= APRIL ? currentYear + 1 : currentYear

  return currentFinancialYearEnd
}

/**
 * Calculates and formats the last six financial years for display on the mark for supplementary billing page.
 *
 * When marking a licence for supplementary billing, financial years from 2023 onward (SROC billing)
 * can be flagged individually. However, years prior to 2023 (pre-SROC) are grouped together,
 * meaning that marking the licence for supplementary billing will apply to all previous years
 * covered by pre-SROC (up to six years).
 */
function _yearsToDisplay() {
  const currentFinancialYearEnd = _determineCurrentFinancialYearEnd()
  const lastSixFinancialYears = []

  for (let i = 0; i < PREVIOUS_SIX_YEARS; i++) {
    const year = currentFinancialYearEnd - i

    if (year > LAST_PRE_SROC_FINANCIAL_YEAR_END) {
      lastSixFinancialYears.push({
        text: formatFinancialYear(year),
        value: year,
        attributes: { 'data-test': `sroc-years-${year}` }
      })
    } else {
      lastSixFinancialYears.push({
        text: 'Before 2022',
        value: 'preSroc',
        hint: { text: 'Old charge scheme' },
        attributes: { 'data-test': 'pre-sroc-years' }
      })

      break
    }
  }

  return lastSixFinancialYears
}

module.exports = {
  go
}
