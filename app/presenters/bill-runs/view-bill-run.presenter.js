'use strict'

/**
 * Formats bill run data ready for presenting in the view bill run page
 * @module ViewBillRunPresenter
 */

const {
  capitalize,
  formatLongDate,
  formatMoney
} = require('../base.presenter.js')

function go (billRun, billSummaries) {
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

  const billRunType = _billRunType(batchType, summer, scheme)
  const regionName = capitalize(region.displayName)

  return {
    billsCount: _billsCount(creditNoteCount, invoiceCount, billRunType, billSummaries),
    billRunId: id,
    billRunNumber,
    billRunStatus: status,
    billRunTotal: _billRunTotal(netTotal),
    billRunType,
    chargeScheme: _chargeScheme(scheme),
    creditsCount: _creditsCount(creditNoteCount),
    creditsTotal: formatMoney(creditNoteValue),
    dateCreated: formatLongDate(createdAt),
    debitsCount: _debitsCount(invoiceCount),
    debitsTotal: formatMoney(invoiceValue),
    displayCreditDebitTotals: _displayCreditDebitTotals(billRun),
    financialYear: _financialYear(toFinancialYearEnding),
    pageTitle: _pageTitle(regionName, billRunType),
    region: regionName,
    transactionFile: transactionFileReference
  }
}

function _billsCount (creditsCount, debitsCount, billRunType, billSummaries) {
  const total = creditsCount + debitsCount

  // NOTE: A bill run wouldn't exist if there was just a single zero value bill on it. So, we can safely assume if the
  // total is 1 it's not for a zero value bill and we can immediately return.
  if (total === 1) {
    return `1 ${billRunType} bill`
  }

  const zeroValueBills = billSummaries.filter((billSummary) => {
    return billSummary.netAmount === 0
  })

  const numberOfZeroValueBills = zeroValueBills.length

  if (numberOfZeroValueBills === 0) {
    return `${total} ${billRunType} bills`
  }

  if (numberOfZeroValueBills === 1) {
    return `${total} ${billRunType} bills and 1 zero value bill`
  }

  return `${total} ${billRunType} bills and ${numberOfZeroValueBills} zero value bills`
}

function _billRunTotal (valueInPence) {
  const valueAsMoney = formatMoney(valueInPence)

  if (valueInPence < 0) {
    return `${valueAsMoney} credit`
  }

  return valueAsMoney
}

function _billRunType (batchType, summer, scheme) {
  if (batchType !== 'two_part_tariff') {
    return capitalize(batchType)
  }

  if (scheme === 'sroc') {
    return 'Two-part tariff'
  }

  if (summer) {
    return 'Two-part tariff summer'
  }

  return 'Two-part tariff winter and all year'
}

function _chargeScheme (scheme) {
  if (scheme === 'sroc') {
    return 'Current'
  }

  return 'Old'
}

function _creditsCount (count) {
  if (count === 1) {
    return '1 credit note'
  }

  return `${count} credit notes`
}

function _debitsCount (count) {
  if (count === 1) {
    return '1 invoice'
  }

  return `${count} invoices`
}

function _displayCreditDebitTotals (billRun) {
  const { batchType } = billRun

  return batchType === 'supplementary'
}

function _financialYear (financialYearEnding) {
  return `${financialYearEnding - 1} to ${financialYearEnding}`
}

function _pageTitle (regionName, billRunType) {
  const lowercaseBillRunType = billRunType.toLowerCase()

  return `${regionName} ${lowercaseBillRunType}`
}

module.exports = {
  go
}
