'use strict'

/**
 * Formats the last 6 financial years ready for presenting in the mark for supplementary billing page
 * @module MarkForSupplementaryBillingPresenter
 */

const { formatFinancialYear } = require('../../base.presenter.js')
const { determineFinancialYearEnd } = require('../../../lib/dates.lib.js')

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
    financialYears: _yearsToDisplay(),
    pageTitle: 'Mark for the supplementary bill run'
  }
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
  const currentFinancialYearEnd = determineFinancialYearEnd(new Date())
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
