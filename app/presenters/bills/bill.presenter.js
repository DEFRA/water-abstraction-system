'use strict'

/**
 * Formats bill data ready for presenting in the single licence bill and multi licence bill pages
 * @module BillPresenter
 */

const {
  capitalize,
  formatLongDate,
  formatMoney
} = require('../base.presenter.js')

function go (bill, billingAccount) {
  const { billRun } = bill

  const formattedBill = {
    accountName: _accountName(billingAccount),
    accountNumber: billingAccount.invoiceAccountNumber,
    addressLines: _addressLines(billingAccount),
    billId: bill.billingInvoiceId,
    billingAccountId: billingAccount.invoiceAccountId,
    billNumber: bill.invoiceNumber,
    billRunId: billRun.billingBatchId,
    billRunNumber: billRun.billRunNumber,
    billRunStatus: billRun.status,
    billRunType: _billRunType(billRun),
    chargeScheme: _scheme(billRun),
    contactName: _contactName(billingAccount),
    credit: bill.isCredit,
    creditsTotal: formatMoney(bill.creditNoteValue),
    dateCreated: formatLongDate(bill.createdAt),
    debitsTotal: formatMoney(bill.invoiceValue),
    deminimis: bill.isDeMinimis,
    displayCreditDebitTotals: _displayCreditDebitTotals(billRun),
    financialYear: _financialYear(billRun),
    flaggedForReissue: bill.isFlaggedForRebilling,
    region: capitalize(billRun.region.displayName),
    total: _total(bill.netAmount, bill.isCredit),
    transactionFile: billRun.transactionFileReference
  }

  return formattedBill
}

function _accountName (billingAccount) {
  const accountAddress = billingAccount.billingAccountAddresses[0]

  if (accountAddress.agentCompany) {
    return accountAddress.agentCompany.name
  }

  return billingAccount.company.name
}

function _addressLines (billingAccount) {
  const { address } = billingAccount.billingAccountAddresses[0]

  const addressParts = [
    address.address1,
    address.address2,
    address.address3,
    address.address4,
    address.town,
    address.county,
    address.postcode,
    address.country
  ]

  return addressParts.filter((part) => part)
}

function _billRunType (billRun) {
  const { batchType, isSummer, scheme } = billRun

  if (batchType !== 'two_part_tariff') {
    return capitalize(batchType)
  }

  if (scheme === 'sroc') {
    return 'Two-part tariff'
  }

  if (isSummer) {
    return 'Two-part tariff summer'
  }

  return 'Two-part tariff winter and all year'
}

function _contactName (billingAccount) {
  const contact = billingAccount.billingAccountAddresses[0].contact

  if (contact) {
    return contact.$name()
  }

  return null
}

function _displayCreditDebitTotals (billRun) {
  const { batchType, source } = billRun

  return batchType === 'supplementary'
}

function _financialYear (billRun) {
  const { fromFinancialYearEnding, toFinancialYearEnding } = billRun

  return `${fromFinancialYearEnding} to ${toFinancialYearEnding}`
}

function _scheme (billRun) {
  if (billRun.scheme === 'sroc') {
    return 'Current'
  }

  return 'Old'
}

function _total (valueInPence, credit) {
  const valueAsMoney = formatMoney(valueInPence)

  if (credit) {
    return `${valueAsMoney} credit`
  }

  return valueAsMoney
}

module.exports = {
  go
}
