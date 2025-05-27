'use strict'

/**
 * Formats billing account data ready for presenting in the view billing account page
 * @module ViewBillingAccountPresenter
 */

const { formatLongDate, formatMoney, titleCase } = require('../base.presenter.js')
const { formatBillRunType } = require('../billing.presenter.js')

/**
 * Formats billing account data ready for presenting in the view billing account page
 *
 * @param {object} billingAccountData -The results from `FetchViewBillingAccountService`
 * @param {string|undefined} licenceId - The UUID of the licence related to the billing account, if available, used to
 * determine the backlink
 *
 * @returns {object} The data formatted for the view template
 */
function go(billingAccountData, licenceId) {
  const { billingAccount, bills, pagination } = billingAccountData
  const { billingAccountAddresses, company, createdAt, id, lastTransactionFile, lastTransactionFileCreatedAt } =
    billingAccount

  return {
    accountNumber: billingAccount.accountNumber,
    address: _address(billingAccountAddresses[0].address, billingAccountAddresses[0].contact, company),
    backLink: _backLink(licenceId),
    billingAccountId: id,
    bills: _bills(bills),
    createdDate: formatLongDate(createdAt),
    customerFile: lastTransactionFile,
    lastUpdated: lastTransactionFileCreatedAt ? formatLongDate(lastTransactionFileCreatedAt) : null,
    pageTitle: 'Billing account for ' + titleCase(company.name),
    pagination
  }
}

/**
 * Formats a company's address for display on the view billing account page.
 *
 * Some companies may have fewer populated address lines than others, resulting in `null` values. This function filters
 * out any empty address lines, applies title casing to each one, and appends the postcode in uppercase.
 *
 * @param {module:AddressModel} address - The address associated with the billing account.
 * @param {module:ContactModel} contact - The contact associated with the billing account.
 * @param {module:CompanyModel} company - The company associated with the billing account.
 *
 * @returns {string[]} An array of formatted address lines for display.
 */
function _address(address, contact, company) {
  const contactName = `FAO ${contact.$name()}`
  const companyName = titleCase(company.name)

  const addressLines = [
    address['address1'],
    address['address2'],
    address['address3'],
    address['address4'],
    address['address5'],
    address['address6']
  ]
    .filter(Boolean)
    .map(titleCase)

  if (address['postcode']) {
    addressLines.push(address['postcode'].toUpperCase())
  }

  return [companyName, contactName, ...addressLines].filter(Boolean)
}

function _backLink(licenceId) {
  if (licenceId) {
    return {
      title: 'Go back to bills',
      link: `/system/licences/${licenceId}/bills`
    }
  }

  return {
    title: 'Go back to search',
    link: '/licences'
  }
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
      financialYear: bill.financialYearEnding
    }
  })
}

module.exports = {
  go
}
