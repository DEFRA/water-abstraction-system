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

function _formatBatchType (batchType) {
  return batchType.replace(/_/g, ' ')
}

function _formatBillNumberLabel (bill) {
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

  return null
}

function _formatBillsToTableRow (bills) {
  return bills.map((bill) => {
    return {
      billNumber: _formatBillNumberLabel(bill),
      dateCreated: formatLongDate(new Date(bill.createdAt)),
      account: bill.accountNumber,
      runType: _formatBatchType(bill.billRun.batchType),
      financialYear: bill.financialYearEnding,
      total: formatMoney(bill.netAmount),
      accountId: bill.billingAccountId,
      id: bill.id,
      rebilling: _formatRebillingInformation(bill),
      legacyId: bill.legacyId,
      credit: bill.credit
    }
  })
}

function _formatRebillingInformation (bill) {
  return {
    flaggedForRebilling: bill.flaggedForRebilling,
    rebillingState: _formatRebillingState(bill.rebillingState)
  }
}

function _formatRebillingState (rebillingState) {
  if (rebillingState === 'rebill') {
    return 'Reissued'
  }

  if (rebillingState === 'reversal') {
    return 'Reversed'
  }
  return null
}

module.exports = {
  go
}
