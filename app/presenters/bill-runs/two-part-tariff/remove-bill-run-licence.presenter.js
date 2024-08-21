'use strict'

/**
 * Formats the data ready for presenting in the remove bill run licence confirmation page
 * @module RemoveBillRunLicencePresenter
 */

const { formatFinancialYear, formatLongDate } = require('../../base.presenter.js')

/**
 * Formats the data ready for presenting in the remove bill run licence confirmation page
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 * @param {string} licenceId - UUID of the licence to remove from the bill run
 * @param {string} licenceRef - the licence reference of the licence to remove from the bill run
 *
 * @returns {object} - the prepared data to be passed to the remove licence template
 */
function go (billRun, licenceId, licenceRef) {
  const { billRunNumber, createdAt, region, status, toFinancialYearEnding } = billRun

  return {
    pageTitle: `You're about to remove ${licenceRef} from the bill run`,
    backLink: `../review/${licenceId}`,
    billRunNumber,
    billRunStatus: status,
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    region
  }
}

module.exports = {
  go
}
