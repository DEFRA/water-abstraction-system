'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/create` page
 * @module CreatePresenter
 */

const {
  formatBillRunType,
  formatChargeScheme,
  formatFinancialYear,
  formatLongDate,
  titleCase
} = require('../../base.presenter.js')

const LAST_PRESROC_YEAR = 2022

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/create` page
 *
 * @param {module:SessionModel} session - The session instance for the setup bill run journey
 * @param {module:BillRunModel} billRun - The matching instance of `BillRunModel` to the setup options selected
 *
 * @returns {object} - The data formatted for the view template
 */
function go (session, billRun) {
  const {
    batchType,
    billRunNumber,
    createdAt,
    id,
    region,
    scheme,
    status,
    summer,
    toFinancialYearEnding
  } = billRun

  const billRunType = formatBillRunType(batchType, scheme, summer)

  return {
    backLink: _backLink(session),
    billRunId: id,
    billRunLink: _billRunLink(billRun),
    billRunNumber,
    billRunStatus: status,
    billRunType,
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    region: titleCase(region.displayName),
    warningMessage: _warningMessage(billRunType, status)
  }
}

function _backLink (session) {
  const { type, year } = session

  if (!type.startsWith('two_part')) {
    return `/system/bill-runs/setup/${session.id}/region`
  }

  if (['2024', '2023'].includes(year)) {
    return `/system/bill-runs/setup/${session.id}/year`
  }

  return `/system/bill-runs/setup/${session.id}/season`
}

function _billRunLink (billRun) {
  const { id: billRunId, status, toFinancialYearEnding } = billRun

  if (status !== 'review') {
    return `/system/bill-runs/${billRunId}`
  }

  if (toFinancialYearEnding > LAST_PRESROC_YEAR) {
    return `/system/bill-runs/${billRunId}/review`
  }

  return `/billing/batch/${billRunId}/two-part-tariff-review`
}

function _warningMessage (billRunType, status) {
  if (billRunType === 'Supplementary') {
    return 'You need to confirm or cancel this bill run before you can create a new one'
  }

  if (status !== 'sent') {
    return 'You need to cancel this bill run before you can create a new one'
  }

  return `You can only have one ${billRunType} per region in a financial year`
}

module.exports = {
  go
}
