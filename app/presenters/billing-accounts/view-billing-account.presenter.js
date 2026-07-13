/**
 * Formats billing account data ready for presenting in the view billing account page
 * @module ViewBillingAccountPresenter
 */

import { formatBillRunType } from '../billing.presenter.js'
import { formatLongDate, formatMoney, titleCase } from '../base.presenter.js'

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
export default function viewBillingAccountPresenter(billingAccountData, licenceId, chargeVersionId, companyId) {
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
      href: `/licences/${licenceId}/charge-information/${chargeVersionId}/view`,
      text: 'Go back to charge information'
    }
  }

  if (licenceId) {
    return {
      href: `/system/licences/${licenceId}/bills`,
      text: 'Go back to bills'
    }
  }

  if (companyId) {
    return {
      href: `/system/companies/${companyId}/billing-accounts`,
      text: 'Go back to customer'
    }
  }

  return {
    href: '/',
    text: 'Go back to search'
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
