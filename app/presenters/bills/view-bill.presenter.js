'use strict'

/**
 * Formats bill and billing account data ready for presenting in the single licence bill and multi licence bill pages
 * @module ViewBillPresenter
 */

const { formatLongDate, formatMoney, titleCase } = require('../base.presenter.js')

/**
 * Formats bill and billing account data ready for presenting in the single licence bill and multi licence bill pages
 *
 * @param {module:BillModel} bill - The bill being viewed
 * @param {module:BillingAccountModel} billingAccount - The billing account linked to the bill
 *
 * @returns {object} page data formatted for the view template
 */
function go(bill, billingAccount) {
  const { billRun } = bill
  const accountName = billingAccount.$accountName()

  const formattedBill = {
    accountName,
    accountNumber: billingAccount.accountNumber,
    addressLines: billingAccount.$addressLines(),
    billId: bill.id,
    billingAccountId: billingAccount.id,
    billNumber: bill.invoiceNumber,
    billRunId: billRun.id,
    billRunNumber: billRun.billRunNumber,
    billRunStatus: billRun.status,
    billRunType: _billRunType(billRun),
    billTotal: _billTotal(bill.netAmount, bill.credit),
    chargeScheme: _scheme(billRun),
    contactName: billingAccount.$contactName(),
    credit: bill.credit,
    creditsTotal: _creditsTotal(bill, billRun),
    dateCreated: formatLongDate(bill.createdAt),
    debitsTotal: _debitsTotal(bill, billRun),
    deminimis: bill.deminimis,
    displayCreditDebitTotals: _displayCreditDebitTotals(billRun),
    financialYear: _financialYear(bill),
    flaggedForReissue: bill.flaggedForRebilling,
    pageTitle: `Bill for ${accountName}`,
    region: titleCase(billRun.region.displayName),
    transactionFile: billRun.transactionFileReference
  }

  return formattedBill
}

function _billRunType(billRun) {
  const { batchType, summer, scheme } = billRun

  if (batchType !== 'two_part_tariff') {
    return titleCase(batchType)
  }

  if (scheme === 'sroc') {
    return 'Two-part tariff'
  }

  if (summer) {
    return 'Two-part tariff summer'
  }

  return 'Two-part tariff winter and all year'
}

function _creditsTotal(bill, billRun) {
  const { creditNoteValue, netAmount } = bill
  const { source } = billRun

  if (source === 'wrls') {
    return formatMoney(creditNoteValue)
  }

  if (netAmount < 0) {
    return formatMoney(netAmount)
  }

  return '£0.00'
}

function _debitsTotal(bill, billRun) {
  const { invoiceValue, netAmount } = bill
  const { source } = billRun

  if (source === 'wrls') {
    return formatMoney(invoiceValue)
  }

  if (netAmount > 0) {
    return formatMoney(netAmount)
  }

  return '£0.00'
}

function _displayCreditDebitTotals(billRun) {
  const { batchType } = billRun

  return batchType === 'supplementary'
}

function _financialYear(bill) {
  const { financialYearEnding } = bill

  return `${financialYearEnding - 1} to ${financialYearEnding}`
}

function _scheme(billRun) {
  if (billRun.scheme === 'sroc') {
    return 'Current'
  }

  return 'Old'
}

function _billTotal(valueInPence, credit) {
  const valueAsMoney = formatMoney(valueInPence)

  if (credit) {
    return `${valueAsMoney} credit`
  }

  return valueAsMoney
}

module.exports = {
  go
}
