'use strict'

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 * @module ViewLicenceBillsPresenter
 */

const { formatLongDate } = require('../base.presenter')

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

function _formatCurrencyToGBP (amount) {
  return amount.toLocaleString('en-gb', {
    style: 'currency',
    currency: 'GBP'
  })
}
function _formatBillsToTableRow (bills) {
  return bills.map((bill) => {
    return {
      billNumber: bill.invoiceNumber,
      dateCreated: formatLongDate(new Date(bill.createdAt)),
      account: bill.accountNumber,
      runType: bill.billRun.batchType,
      financialYear: bill.financialYearEnding,
      total: _formatCurrencyToGBP(bill.netAmount),
      accountId: bill.billingAccountId,
      id: bill.id
    }
  })
}

module.exports = {
  go
}
