'use strict'

/**
 * Formats the review licence data ready for presenting in the remove review licence confirmation page
 * @module RemovePresenter
 */

const { formatFinancialYear, formatLongDate } = require('../../base.presenter.js')

/**
 * Formats the review licence data ready for presenting in the remove review licence confirmation page
 *
 * @param {module:ReviewLicenceModel} reviewLicence - instance of the `ReviewLicenceModel` returned from
 * `FetchRemoveReviewLicenceService`
 *
 * @returns {object}page date needed for the remove review licence confirmation page
 */
function go (reviewLicence) {
  const { billRun, id: reviewLicenceId, licenceRef } = reviewLicence
  const { billRunNumber, createdAt, region, status, toFinancialYearEnding } = billRun

  return {
    billRunNumber,
    billRunStatus: status,
    dateCreated: formatLongDate(createdAt),
    financialYearPeriod: formatFinancialYear(toFinancialYearEnding),
    pageTitle: `You're about to remove ${licenceRef} from the bill run`,
    region: region.displayName,
    reviewLicenceId
  }
}

module.exports = {
  go
}
