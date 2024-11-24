'use strict'

/**
 * Formats data for the confirm remove a bill licence page
 * @module RemoveBillLicencePresenter
 */

const {
  formatBillRunType,
  formatChargeScheme,
  formatFinancialYear,
  formatLongDate,
  formatMoney,
  titleCase
} = require('../base.presenter.js')

/**
 * Formats data for the confirm remove a bill licence page
 *
 * @param {module:BillLicenceModel} billLicence - an instance of `BillLicenceModel` with associated billing data
 *
 * @returns {object} - the prepared bill licence summary data to be passed to the confirm remove a bill licence page
 */
function go(billLicence) {
  const { id: billLicenceId, bill, licenceRef, transactions } = billLicence

  const { billRunNumber, billRunStatus, billRunType, chargeScheme, dateCreated, financialYear, region } =
    _billRunSummary(bill.billRun)

  return {
    accountName: _accountName(bill.billingAccount),
    accountNumber: bill.billingAccount.accountNumber,
    billLicenceId,
    billRunNumber,
    billRunStatus,
    billRunType,
    chargeScheme,
    dateCreated,
    financialYear,
    licenceRef,
    pageTitle: _pageTitle(licenceRef),
    region,
    transactionsTotal: _total(transactions)
  }
}

function _accountName(billingAccount) {
  const accountAddress = billingAccount.billingAccountAddresses[0]

  if (accountAddress.company) {
    return accountAddress.company.name
  }

  return billingAccount.company.name
}

function _billRunSummary(billRun) {
  const { batchType, billRunNumber, createdAt, region, scheme, status, summer, toFinancialYearEnding } = billRun

  return {
    billRunNumber,
    billRunStatus: status,
    billRunType: formatBillRunType(batchType, scheme, summer),
    chargeScheme: formatChargeScheme(scheme),
    dateCreated: formatLongDate(createdAt),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    region: titleCase(region.displayName)
  }
}

function _pageTitle(licenceRef) {
  return `You're about to remove ${licenceRef} from the bill run`
}

function _total(transactions) {
  const transactionTotal = transactions.reduce((total, transaction) => {
    total += transaction.netAmount

    return total
  }, 0)

  return formatMoney(transactionTotal, true)
}

module.exports = {
  go
}
