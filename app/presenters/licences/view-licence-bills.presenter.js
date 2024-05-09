'use strict'

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 * @module ViewLicenceBillsPresenter
 */

const { formatLongDate, formatMoney } = require('../base.presenter')

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 *
 * @returns {Object} The data formatted for the view template
 */
function go (bills) {
  return {
    activeTab: 'bills',
    bills: _formatBillsToTableRow(bills)
  }
}

function _formatBillsToTableRow (bills) {
  return bills.map((bill) => {
    return {
      billNumber: bill.invoiceNumber,
      dateCreated: formatLongDate(new Date(bill.createdAt)),
      account: bill.accountNumber,
      runType: _formatBatchType(bill.billRun.batchType),
      financialYear: bill.financialYearEnding,
      total: formatMoney(bill.netAmount),
      accountId: bill.billingAccountId,
      id: bill.id
    }
  })
}

function _formatBatchType (batchType) {
  return batchType.replace(/_/g, ' ')
}

module.exports = {
  go
}
