'use strict'

/**
 * @module ReviewBillRunPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

function go (billRun, licences) {
  const licencesToReviewCount = _prepareLicences(licences)

  const preparedBillRun = _prepareBillRun(billRun, licences, licencesToReviewCount)

  return { ...preparedBillRun, licences }
}

function _prepareLicences (licences) {
  let licencesToReviewCount = 0

  for (const licence of licences) {
    if (licence.status === 'review') {
      licencesToReviewCount++
    }

    licence.issue = _getIssueOnLicence(licence.issues)
  }

  return licencesToReviewCount
}

function _prepareBillRun (billRun, billRunLicences, licencesToReviewCount) {
  return {
    region: billRun.region.displayName,
    status: billRun.status,
    dateCreated: formatLongDate(billRun.createdAt),
    financialYear: _financialYear(billRun.toFinancialYearEnding),
    chargeScheme: 'Current',
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
