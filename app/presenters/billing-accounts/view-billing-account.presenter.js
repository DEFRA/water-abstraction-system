'use strict'

/**
 * Formats billing account data ready for presenting in the view billing account page
 * @module ViewBillingAccountPresenter
 */

const FeatureFlagsConfig = require('../../../config/feature-flags.config.js')
const { formatBillRunType } = require('../billing.presenter.js')
const { formatLongDate, formatMoney, titleCase } = require('../base.presenter.js')

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
  const { billingAccount, bills } = billingAccountData
  const { company, createdAt, id, lastTransactionFile, lastTransactionFileCreatedAt } = billingAccount

  return {
    address: billingAccount.$displayAddress(),
    backLink: _backLink(licenceId, chargeVersionId, companyId),
    billingAccountId: id,
    bills: _bills(bills),
    createdDate: formatLongDate(createdAt),
    customerFile: lastTransactionFile,
    lastUpdated: lastTransactionFileCreatedAt ? formatLongDate(lastTransactionFileCreatedAt) : null,
    pageTitle: 'Billing account for ' + titleCase(company.name),
    pageTitleCaption: `Billing account ${billingAccount.accountNumber}`
  }
}

function _backLink(licenceId, chargeVersionId, companyId) {
  if (licenceId && chargeVersionId) {
    return {
      title: 'Go back to charge information',
      href: `/licences/${licenceId}/charge-information/${chargeVersionId}/view`
    }
  }

  if (licenceId) {
    return {
      title: 'Go back to bills',
      href: `/system/licences/${licenceId}/bills`
    }
  }

  if (companyId) {
    const href = FeatureFlagsConfig.enableCustomerView
      ? `/system/companies/${companyId}/billing-accounts`
      : `/customer/${companyId}/#billing-accounts`

    return {
      title: 'Go back to customer',
      href
    }
  }

  return {
    title: 'Go back to search',
    href: '/'
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
