'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/check` page when the bill run is blocked from creation
 * @module BlockedBillRunPresenter
 */

const { formatLongDate } = require('../../../base.presenter.js')
const { checkPageBackLink } = require('./base-check.presenter.js')
const { formatBillRunType, formatChargeScheme } = require('../../../billing.presenter.js')

const LAST_PRESROC_YEAR = 2022

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/check` page when the bill run is blocked from creation
 *
 * @param {module:SessionModel} session - The session instance for the setup bill run journey
 * @param {object} blockingResults - The results from `DetermineBlockingBillRunService`
 *
 * @returns {object} - The data formatted for the /check view template
 */
function go(session, blockingResults) {
  const { id: sessionId, regionName } = session

  const { matches, toFinancialYearEnding } = blockingResults

  const firstMatch = matches[0]
  const billRunType = formatBillRunType(firstMatch.batchType, firstMatch.scheme, firstMatch.summer)
  const messages = _messages(firstMatch, billRunType)

  return {
    backLink: checkPageBackLink(session),
    billRunLink: _billRunLink(firstMatch),
    billRunNumber: firstMatch.billRunNumber,
    billRunStatus: firstMatch.status,
    billRunType,
    chargeScheme: formatChargeScheme(firstMatch.scheme),
    dateCreated: formatLongDate(firstMatch.createdAt),
    financialYearEnd: toFinancialYearEnding,
    pageTitle: messages.title,
    regionName,
    sessionId,
    showCreateButton: false,
    warningMessage: messages.warning
  }
}

function _billRunLink(firstMatch) {
  const { id: billRunId, status, toFinancialYearEnding } = firstMatch

  if (status !== 'review') {
    return `/system/bill-runs/${billRunId}`
  }

  if (toFinancialYearEnding > LAST_PRESROC_YEAR) {
    return `/system/bill-runs/review/${billRunId}`
  }

  return `/billing/batch/${billRunId}/two-part-tariff-review`
}

function _messages(firstMatch, billRunType) {
  const { batchType, status } = firstMatch

  if (batchType === 'supplementary') {
    return {
      title: 'This bill run is blocked',
      warning: 'You need to confirm or cancel the existing bill run before you can create a new one'
    }
  }

  if (status !== 'sent') {
    return {
      title: 'This bill run already exists',
      warning: 'You need to cancel the existing bill run before you can create a new one'
    }
  }

  return {
    title: 'This bill run already exists',
    warning: `You can only have one ${billRunType} bill run per region in a financial year`
  }
}

module.exports = {
  go
}
