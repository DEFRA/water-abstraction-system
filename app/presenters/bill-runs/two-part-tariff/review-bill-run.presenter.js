'use strict'

/**
 * @module ReviewBillRunPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

const READY = 'ready'
const REVIEW = 'review'

function go (billRun, billRunLicences) {
  const { licences, licencesToReviewCount } = _prepareLicences(billRunLicences)

  const preparedBillRun = _prepareBillRun(billRun, billRunLicences, licencesToReviewCount)

  return { ...preparedBillRun, licences }
}

function _prepareLicences (billRunLicences) {
  const licences = []
  let licencesToReviewCount = 0

  for (const billRunLicence of billRunLicences) {
    const { issue, status } = _issuesOnLicence(billRunLicence)

    if (status === REVIEW) {
      licencesToReviewCount++
    }

    licences.push({
      licenceId: billRunLicence.licenceId,
      licenceRef: billRunLicence.licenceRef,
      licenceHolder: billRunLicence.licenceHolder,
      licenceIssues: issue,
      licenceStatus: status
    })
  }

  return { licencesToReviewCount, licences }
}

function _prepareBillRun (billRun, billRunLicences, licencesToReviewCount) {
  return {
    region: billRun.region.displayName,
    status: billRun.status,
    dateCreated: formatLongDate(billRun.createdAt),
    financialYear: _financialYear(billRun.toFinancialYearEnding),
    chargeScheme: _scheme(billRun.scheme),
    billRunType: _billRunType(billRun.batchType),
    numberOfLicences: billRunLicences.length,
    licencesToReviewCount
  }
}

function _billRunType (billRunType) {
  if (billRunType === 'two_part_tariff') {
    return 'two-part tariff'
  }
}

function _scheme (scheme) {
  if (scheme === 'sroc') {
    return 'Current'
  }
}

function _financialYear (financialYearEnding) {
  const startYear = financialYearEnding - 1
  const endYear = financialYearEnding

  return `${startYear} to ${endYear}`
}

function _issuesOnLicence (licence) {
  if (licence.issues.length > 1) {
    return { issue: 'Multiple Issues', status: REVIEW }
  } else if (licence.issues.length === 1) {
    return { issue: licence.issues[0], status: licence.status }
  } else {
    return { issue: '', status: READY }
  }
}

module.exports = {
  go
}
