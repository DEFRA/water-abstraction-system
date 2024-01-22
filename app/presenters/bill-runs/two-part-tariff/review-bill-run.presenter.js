'use strict'
/**
 * @module ReviewBillRunPresenter
 */

function go (licence, issues) {
  const { issue, status } = _issuesOnLicence(issues)
  licence.issue = issue

  const preparedLicence = {
    licenceId: licence.licenceId,
    licenceRef: licence.licenceRef,
    licenceHolder: licence.licenceHolder,
    licenceIssues: licence.issue,
    licenceStatus: status
  }

  return preparedLicence
}

function _issuesOnLicence (issues) {
  if (issues.issues.length > 1) {
    return { issue: 'Multiple Issues', status: 'Review' }
  } else if (issues.length === 1) {
    return { issue: issues.issues[0], status: issues.status }
  } else {
    return { issue: '', status: 'Ready' }
  }
}

module.exports = {
  go
}
