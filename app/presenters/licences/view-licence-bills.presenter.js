'use strict'

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 * @module ViewLicenceBillsPresenter
 */

const { formatBillRunType, formatLongDate, formatMoney } = require('../base.presenter.js')

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 *
 * @param {object[]} bills - The licence's bills
 *
 * @returns {object} The data formatted for the view template
 */
function go(bills) {
  return {
    bills: _bills(bills)
  }
}

function _bills(bills) {
  return bills.map((bill) => {
    const {
      accountNumber,
      billingAccountId,
      billRun,
      createdAt,
      credit,
      financialYearEnding,
      id: billId,
      netAmount
    } = bill

    return {
      accountNumber,
      billingAccountId,
      billId,
      billNumber: _formatBillNumber(bill),
      billRunType: formatBillRunType(billRun.batchType, billRun.scheme, billRun.summer),
      credit,
      dateCreated: formatLongDate(createdAt),
      financialYearEnding,
      total: formatMoney(netAmount)
    }
  })
}

function _formatBillNumber(bill) {
  if (bill.invoiceNumber) {
    return bill.invoiceNumber
  }

  if (bill.deminimis) {
    return 'De minimis bill'
  }

  if (bill.legacyId) {
    return 'NALD revised bill'
  }

  if (bill.netAmount === 0) {
    return 'Zero value bill'
  }

  return ''
}

module.exports = {
  go
}
