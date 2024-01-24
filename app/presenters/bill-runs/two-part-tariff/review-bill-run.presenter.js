'use strict'

/**
 * @module ReviewBillRunPresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

const READY = 'ready'
const REVIEW = 'review'

function go (billRun, licences) {
  const { preparedLicences, licencesToReviewCount } = _prepareLicences(licences)

  const preparedBillRun = _prepareBillRun(billRun, licences, licencesToReviewCount)

  return { preparedLicences, preparedBillRun }
}

function _prepareLicences (licences) {
  const preparedLicences = []
  let licencesToReviewCount = 0

  for (const licence of licences) {
    const { issue, status } = _issuesOnLicence(licence)

    if (status === REVIEW) {
      licencesToReviewCount++
    }

    preparedLicences.push({
      licenceId: licence.licenceId,
      licenceRef: licence.licenceRef,
      licenceHolder: licence.licenceHolder,
      licenceIssues: issue,
      licenceStatus: status
    })
  }

  return { licencesToReviewCount, preparedLicences }
}

function _prepareBillRun (billRun, licences, licencesToReviewCount) {
  return {
    region: billRun.region.displayName,
    status: billRun.status,
    dateCreated: formatLongDate(billRun.createdAt),
    financialYear: _financialYear(billRun.toFinancialYearEnding),
    chargeScheme: _scheme(billRun.scheme),
    billRunType: _billRunType(billRun.batchType),
    numberOfLicences: licences.length,
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
