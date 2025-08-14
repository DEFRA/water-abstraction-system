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
 * @param {string|undefined} chargeVersionId - The UUID of the charge version related to the billing account, if
 * available, used to determine the backlink
 * @param {string|undefined} companyId - The UUID of the company (customer) related to the billing account, if
 * available, used to determine the backlink
 *
 * @returns {object} The data formatted for the view template
 */
function go(billingAccountData, licenceId, chargeVersionId, companyId) {
  const { billingAccount, bills, pagination } = billingAccountData
  const { billingAccountAddresses, company, createdAt, id, lastTransactionFile, lastTransactionFileCreatedAt } =
    billingAccount

  return {
    accountNumber: billingAccount.accountNumber,
    address: _address(billingAccountAddresses[0], company),
    backLink: _backLink(licenceId, chargeVersionId, companyId),
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
 * Formats a billing account's address for display on the view billing account page.
 *
 * Some billing accounts will have a different company linked to them via the billing account address, then the primary
 * company against the billing account itself. This happens if a user opts to set a different company that the bills
 * should be sent to. So we have to handle this when determining the 'company name'.
 *
 * Also, some billing accounts may have fewer populated address lines than others, resulting in `null` values. This
 * function filters out any empty address lines, applies title casing to each one, and appends the postcode in
 * uppercase.
 *
 * @private
 */
function _address(billingAccountAddress, primaryCompany) {
  const { address, company, contact } = billingAccountAddress
  const contactName = contact ? `FAO ${contact.$name()}` : null
  const addressCompanyName = company ? company.name : primaryCompany.name

  const companyName = titleCase(addressCompanyName)

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

function _backLink(licenceId, chargeVersionId, companyId) {
  if (licenceId && chargeVersionId) {
    return {
      title: 'Go back to charge information',
      link: `/licences/${licenceId}/charge-information/${chargeVersionId}/view`
    }
  }

  if (licenceId) {
    return {
      title: 'Go back to bills',
      link: `/system/licences/${licenceId}/bills`
    }
  }

  if (companyId) {
    return {
      title: 'Go back to customer',
      link: `/customer/${companyId}/#billing-accounts`
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
