'use strict'

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 * @module ViewLicenceBillsPresenter
 */

const { formatLongDate, formatMoney } = require('../base.presenter.js')
const { formatBillRunType } = require('../billing.presenter.js')

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Formats data for the `/licences/{id}/bills` view licence bill page
 *
 * @param {string} licenceId - The UUID of the licence
 * @param {object[]} bills - The licence's bills
 *
 * @returns {object} The data formatted for the view template
 */
function go(licenceId, bills) {
  return {
    bills: _bills(licenceId, bills)
  }
}

function _bills(licenceId, bills) {
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
      billingAccountLink: _billingAccountLink(billingAccountId, licenceId),
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

function _billingAccountLink(billingAccountId, licenceId) {
  if (FeatureFlagsConfig.enableBillingAccountView) {
    return `/system/billing-accounts/${billingAccountId}?licence-id=${licenceId}`
  }

  return `/billing-accounts/${billingAccountId}`
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
