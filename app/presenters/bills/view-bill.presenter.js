'use strict'

/**
 * Formats bill data ready for presenting in the single licence bill and multi licence bill pages
 * @module ViewBillPresenter
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
    accountNumber: billingAccount.accountNumber,
    addressLines: _addressLines(billingAccount),
    billId: bill.id,
    billingAccountId: billingAccount.id,
    billNumber: bill.invoiceNumber,
    billRunId: billRun.id,
    billRunNumber: billRun.billRunNumber,
    billRunStatus: billRun.status,
    billRunType: _billRunType(billRun),
    billTotal: _billTotal(bill.netAmount, bill.credit),
    chargeScheme: _scheme(billRun),
    contactName: _contactName(billingAccount),
    credit: bill.credit,
    creditsTotal: _creditsTotal(bill, billRun),
    dateCreated: formatLongDate(bill.createdAt),
    debitsTotal: _debitsTotal(bill, billRun),
    deminimis: bill.deminimis,
    displayCreditDebitTotals: _displayCreditDebitTotals(billRun),
    financialYear: _financialYear(bill),
    flaggedForReissue: bill.flaggedForRebilling,
    region: capitalize(billRun.region.displayName),
    transactionFile: billRun.transactionFileReference
  }

  return formattedBill
}

function _accountName (billingAccount) {
  const accountAddress = billingAccount.billingAccountAddresses[0]

  if (accountAddress.company) {
    return accountAddress.company.name
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
    address.address5,
    address.address6,
    address.postcode,
    address.country
  ]

  return addressParts.filter((part) => part)
}

function _billRunType (billRun) {
  const { batchType, summer, scheme } = billRun

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

function _contactName (billingAccount) {
  const contact = billingAccount.billingAccountAddresses[0].contact

  if (contact) {
    return contact.$name()
  }

  return null
}

function _creditsTotal (bill, billRun) {
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

function _debitsTotal (bill, billRun) {
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

function _displayCreditDebitTotals (billRun) {
  const { batchType } = billRun

  return batchType === 'supplementary'
}

function _financialYear (bill) {
  const { financialYearEnding } = bill

  return `${financialYearEnding - 1} to ${financialYearEnding}`
}

function _scheme (billRun) {
  if (billRun.scheme === 'sroc') {
    return 'Current'
  }

  return 'Old'
}

function _billTotal (valueInPence, credit) {
  const valueAsMoney = formatMoney(valueInPence)

  if (credit) {
    return `${valueAsMoney} credit`
  }

  return valueAsMoney
}

module.exports = {
  go
}
