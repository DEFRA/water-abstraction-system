'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the review page
 * @module ReviewBillRunPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and licence data for presentation
 *
 * @param {module:BillRunModel} billRun The data from the bill run
 * @param {module:LicenceModel} licences The licences data asociated with the bill run
 * @param {String} filterLicenceHolder The string that the licence holder is to be filtered on if any
 *
 * @returns {Object} The prepared bill run and licence data to be passed to the review page
 */
function go (billRun, licences, filterLicenceHolder) {
  const { licencesToReviewCount, preparedLicences } = _prepareLicences(licences)

  const preparedBillRun = _prepareBillRun(billRun, preparedLicences, licencesToReviewCount)
  const filterData = { openFilter: false }

  if (filterLicenceHolder) {
    filterData.openFilter = true
    filterData.licenceHolder = filterLicenceHolder
  }

  return { ...preparedBillRun, preparedLicences, filterData }
}

function _prepareLicences (licences) {
  let licencesToReviewCount = 0
  const preparedLicences = []

  for (const licence of licences) {
    if (licence.status === 'review') {
      licencesToReviewCount++
    }

    preparedLicences.push({
      id: licence.licenceId,
      licenceRef: licence.licenceRef,
      licenceHolder: licence.licenceHolder,
      status: licence.status,
      issue: _getIssueOnLicence(licence.issues)
    })
  }

  return { preparedLicences, licencesToReviewCount }
}

function _prepareBillRun (billRun, preparedLicences, licencesToReviewCount) {
  return {
    region: billRun.region.displayName,
    status: billRun.status,
    dateCreated: formatLongDate(billRun.createdAt),
    financialYear: _financialYear(billRun.toFinancialYearEnding),
    billRunType: 'two-part tariff',
    numberOfLicencesDisplayed: preparedLicences.length,
    licencesToReviewCount,
    totalNumberOfLicences: billRun.reviewLicences[0].totalNumberOfLicences
  }
}

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

function _getIssueOnLicence (issues) {
  // if there is more than one issue the issues will be seperated by a comma
  if (issues.includes(',')) {
    return 'Multiple Issues'
  }

  return issues
}

module.exports = {
  go
}
