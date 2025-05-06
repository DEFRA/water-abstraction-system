'use strict'

/**
 * Formats billing account data ready for presenting in the view billing accounts page
 * @module ViewBillingAccountPresenter
 */

const { formatLongDate, formatMoney, titleCase } = require('../base.presenter.js')
const { formatBillRunType } = require('../billing.presenter.js')

/**
 * Formats billing account data ready for presenting in the view billing accounts page
 *
 * @param {module:BillingAccountModel} billingAccountData - The billing account and related licence data
 *
 * @returns {object} The data formatted for the view template
 */
function go(billingAccountData) {
  const { billingAccount, bills, licenceId, pagination } = billingAccountData
  const {
    accountNumber,
    billingAccountAddresses,
    company,
    createdAt,
    id,
    lastTransactionFile,
    lastTransactionFileCreatedAt
  } = billingAccount

  return {
    accountNumber,
    address: _address(billingAccountAddresses[0].address, company),
    billingAccountId: id,
    bills: _bills(bills),
    createdDate: formatLongDate(createdAt),
    customerFile: lastTransactionFile,
    lastUpdated: lastTransactionFileCreatedAt ? formatLongDate(lastTransactionFileCreatedAt) : null,
    licenceId,
    pageTitle: 'Billing account for ' + titleCase(company.name),
    pagination
  }
}

function _address(address, company) {
  const addressLines = [
    company.name,
    address['address1'],
    address['address2'],
    address['address3'],
    address['address4'],
    address['address5'],
    address['address6'],
    address['postcode']
  ]

  const validAddressLines = addressLines.filter((addressLine) => {
    return addressLine
  })

  return validAddressLines.map((validAddressLine) => {
    return titleCase(validAddressLine)
  })
}

function _bills(bills) {
  return bills.map((bill) => {
    const { billRun } = bill
    return {
      billId: bill.id,
      billNumber: bill.invoiceNumber || 'Zero value bill',
      billRunNumber: billRun.billRunNumber,
      billRunType: formatBillRunType(billRun.batchType, billRun.scheme, billRun.summer),
      billTotal: bill.credit ? formatMoney(bill.netAmount) + ' Credit' : formatMoney(bill.netAmount),
      dateCreated: formatLongDate(bill.createdAt),
      financialYear: bill.financialYear
    }
  })
}

module.exports = {
  go
}
