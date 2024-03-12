'use strict'

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/create` page
 * @module CreatePresenter
 */

const {
  capitalize,
  formatBillRunType,
  formatChargeScheme,
  formatFinancialYear,
  formatLongDate
} = require('../../base.presenter.js')

/**
 * Formats data for the `/bill-runs/setup/{sessionId}/create` page
 *
 * @param {module:SessionModel} session - The session instance for the setup bill run journey
 * @param {module:BillRunModel} billRun - The matching instance of `BillRunModel` to the setup options selected
 *
 * @returns {Object} - The data formatted for the view template
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
    billRunNumber,
    billRunStatus: status,
    billRunType,
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    region: capitalize(region.displayName),
    warningMessage: _warningMessage(billRunType, status)
  }
}

function _backLink (session) {
  const { type, year } = session.data

  if (!type.startsWith('two_part')) {
    return `/system/bill-runs/setup/${session.id}/region`
  }

  if (['2024', '2023'].includes(year)) {
    return `/system/bill-runs/setup/${session.id}/year`
  }

  return `/system/bill-runs/setup/${session.id}/season`
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
