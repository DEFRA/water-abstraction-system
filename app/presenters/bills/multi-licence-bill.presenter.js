'use strict'

/**
 * Formats data for a bill including its licence summaries into what is needed for the multi-licence bill page
 * @module MultiLicenceBillPresenter
 */

const {
  capitalize,
  formatLongDate,
  formatMoney
} = require('../base.presenter.js')

function go (bill, licenceSummaries, billingAccount) {
  const { billRun } = bill

  const billLicences = _billLicences(licenceSummaries)

  const formattedBill = {
    accountName: _accountName(billingAccount),
    accountNumber: billingAccount.invoiceAccountNumber,
    addressLines: _addressLines(billingAccount),
    billId: bill.billingInvoiceId,
    billingAccountId: billingAccount.invoiceAccountId,
    billLicences,
    billNumber: bill.invoiceNumber,
    billRunId: billRun.billingBatchId,
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
    tableCaption: _tableCaption(billLicences),
    total: _total(bill.netAmount, bill.isCredit),
    transactionFile: billRun.transactionFileReference
  }

  return formattedBill
}

function _accountName (billingAccount) {
  const accountAddress = billingAccount.invoiceAccountAddresses[0]

  if (accountAddress.agentCompany) {
    return accountAddress.agentCompany.name
  }

  return billingAccount.company.name
}

function _addressLines (billingAccount) {
  const { address } = billingAccount.invoiceAccountAddresses[0]

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

function _billLicences (licenceSummaries) {
  return licenceSummaries.map((licenceSummary) => {
    const { billingInvoiceLicenceId: id, licenceRef: reference, total } = licenceSummary

    return {
      id,
      reference,
      total: formatMoney(total)
    }
  })
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
  const contact = billingAccount.invoiceAccountAddresses[0].contact

  if (contact) {
    return contact.$name()
  }

  return null
}

function _displayCreditDebitTotals (billRun) {
  const { batchType, source } = billRun

  return batchType === 'supplementary' && source === 'wrls'
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

function _tableCaption (billLicences) {
  const numberOfRows = billLicences.length

  if (numberOfRows === 1) {
    return '1 licence'
  }

  return `${numberOfRows} licences`
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
