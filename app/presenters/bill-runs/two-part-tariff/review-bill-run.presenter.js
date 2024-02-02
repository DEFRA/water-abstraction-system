'use strict'

/**
 * Formats the two part tariff review data ready for presenting in the review page
 * @module ReviewBillRunPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

/**
 * Prepares and processes bill run and licence data for presentation
 *
 * @param {module:BillRunModel} billRun the data from the bill run
 * @param {module:LicenceModel} licences the licences data asociated with the bill run
 *
 * @returns {Object} the prepared bill run and licence data to be passed to the review page
 */
function go (billRun, licences) {
  const { licencesToReviewCount, preparedLicences } = _prepareLicences(licences)

  const preparedBillRun = _prepareBillRun(billRun, preparedLicences, licencesToReviewCount)

  return { ...preparedBillRun, preparedLicences }
}

function _prepareLicences (licences) {
  let licencesToReviewCount = 0
  const preparedLicences = []

  for (const licence of licences) {
    if (licence.status === 'review') {
      licencesToReviewCount++
    }

    preparedLicences.push({
      licenceRef: licence.licenceRef,
      licenceHolder: licence.licenceHolder,
      status: licence.status,
      issue: _getIssueOnLicence(licence.issues)
    })
  }

  return { preparedLicences, licencesToReviewCount }
}

function _prepareBillRun (billRun, billRunLicences, licencesToReviewCount) {
  return {
    region: billRun.region.displayName,
    status: billRun.status,
    dateCreated: formatLongDate(billRun.createdAt),
    financialYear: _financialYear(billRun.toFinancialYearEnding),
    billRunType: 'two-part tariff',
    numberOfLicences: billRunLicences.length,
    licencesToReviewCount
  }
}

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

function _getIssueOnLicence (issues) {
  if (issues.length > 1) {
    return 'Multiple Issues'
  } else if (issues.length === 1) {
    return issues[0]
  } else {
    return ''
  }
}

module.exports = {
  go
}
