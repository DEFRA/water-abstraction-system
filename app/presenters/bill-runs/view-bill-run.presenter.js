'use strict'

/**
 * Formats bill run data ready for presenting in the view bill run page
 * @module ViewBillRunPresenter
 */

const {
  generateBillRunTitle,
  formatBillRunType,
  formatChargeScheme,
  formatFinancialYear,
  formatLongDate,
  formatMoney,
  titleCase
} = require('../base.presenter.js')

/**
 * Formats bill run data ready for presenting in the view bill run page
 *
 * @param {module:BillRunModel} billRun - an instance of `BillRunModel`
 * @param {object[]} billSummaries - summary data of bills connected to the bill run
 *
 * @returns {object} - the prepared bill run data to be passed to the view bill run page
 */
function go(billRun, billSummaries) {
  const {
    batchType,
    billRunNumber,
    createdAt,
    creditNoteCount,
    creditNoteValue,
    id,
    invoiceCount,
    invoiceValue,
    netTotal,
    region,
    scheme,
    status,
    summer,
    transactionFileReference,
    toFinancialYearEnding
  } = billRun

  const billRunType = formatBillRunType(batchType, scheme, summer)

  return {
    billsCount: _billsCount(creditNoteCount, invoiceCount, billRunType, billSummaries),
    billRunId: id,
    billRunNumber,
    billRunStatus: status,
    billRunTotal: _billRunTotal(netTotal),
    billRunType,
    chargeScheme: formatChargeScheme(scheme),
    creditsCount: _creditsCount(creditNoteCount),
    creditsTotal: formatMoney(creditNoteValue),
    dateCreated: formatLongDate(createdAt),
    debitsCount: _debitsCount(invoiceCount),
    debitsTotal: formatMoney(invoiceValue),
    displayCreditDebitTotals: _displayCreditDebitTotals(billRun),
    financialYear: formatFinancialYear(toFinancialYearEnding),
    pageTitle: generateBillRunTitle(region.displayName, batchType, scheme, summer),
    region: titleCase(region.displayName),
    transactionFile: transactionFileReference
  }
}

function _billsCount(creditsCount, debitsCount, billRunType, billSummaries) {
  const total = creditsCount + debitsCount

  // NOTE: A bill run wouldn't exist if there was just a single zero value bill on it. So, we can safely assume if the
  // total is 1 it's not for a zero value bill and we can immediately return.
  if (total === 1) {
    return `1 ${billRunType} bill`
  }

  const numberOfZeroValueBills = billSummaries.reduce((count, billSummary) => {
    if (billSummary.netAmount === 0) {
      count += 1
    }

    return count
  }, 0)

  if (numberOfZeroValueBills === 0) {
    return `${total} ${billRunType} bills`
  }

  if (numberOfZeroValueBills === 1) {
    return `${total} ${billRunType} bills and 1 zero value bill`
  }

  return `${total} ${billRunType} bills and ${numberOfZeroValueBills} zero value bills`
}

function _billRunTotal(valueInPence) {
  const valueAsMoney = formatMoney(valueInPence)

  if (valueInPence < 0) {
    return `${valueAsMoney} credit`
  }

  return valueAsMoney
}

function _creditsCount(count) {
  if (count === 1) {
    return '1 credit note'
  }

  return `${count} credit notes`
}

function _debitsCount(count) {
  if (count === 1) {
    return '1 invoice'
  }

  return `${count} invoices`
}

function _displayCreditDebitTotals(billRun) {
  const { batchType } = billRun

  return batchType === 'supplementary'
}

module.exports = {
  go
}
