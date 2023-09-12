'use strict'

/**
 * Generates a mock bill run based on a real one
 * @module GenerateBillRunService
 */

const BillBunModel = require('../../../models/water/bill-run.model.js')
const GenerateMockDataService = require('./generate-mock-data.service.js')
const MockBillRunPresenter = require('../../../presenters/data/mock-bill-run.presenter.js')

async function go (id) {
  const billRun = await _fetchBillRun(id)

  if (!billRun) {
    throw new Error('No matching bill run exists')
  }

  _mockBills(billRun.bills)

  return _response(billRun)
}

async function _fetchBillRun (id) {
  return BillBunModel.query()
    .findById(id)
    .select([
      'billingBatchId',
      'batchType',
      'billRunNumber',
      'dateCreated',
      'fromFinancialYearEnding',
      'netTotal',
      'scheme',
      'status',
      'toFinancialYearEnding',
      'transactionFileReference'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'name'
      ])
    })
    .withGraphFetched('bills')
    .modifyGraph('bills', (builder) => {
      builder.select([
        'billingInvoiceId',
        'creditNoteValue',
        'invoiceAccountNumber',
        'invoiceNumber',
        'invoiceValue',
        'netAmount'
      ])
    })
    .withGraphFetched('bills.billLicences')
    .modifyGraph('bills.billLicences', (builder) => {
      builder.select([
        'billingInvoiceLicenceId',
        'licenceRef'
      ])
    })
    .withGraphFetched('bills.billLicences.licence')
    .modifyGraph('bills.billLicences.licence', (builder) => {
      builder.select([
        'isWaterUndertaker'
      ])
    })
    .withGraphFetched('bills.billLicences.transactions')
    .modifyGraph('bills.billLicences.transactions', (builder) => {
      builder.select([
        'authorisedDays',
        'billableDays',
        'billableQuantity',
        'chargeCategoryCode',
        'chargeCategoryDescription',
        'chargeType',
        'description',
        'endDate',
        'grossValuesCalculated',
        'isCredit',
        'netAmount',
        'startDate',
        'supportedSourceName'
      ])
    })
    .withGraphFetched('bills.billLicences.transactions.chargeElement')
    .modifyGraph('bills.billLicences.transactions.chargeElement', (builder) => {
      builder.select([
        'adjustments'
      ])
    })
    .withGraphFetched('bills.billLicences.transactions.chargeElement.chargePurposes')
    .modifyGraph('bills.billLicences.transactions.chargeElement.chargePurposes', (builder) => {
      builder.select([
        'chargePurposeId',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'authorisedAnnualQuantity'
      ])
    })
    .withGraphFetched('bills.billLicences.transactions.chargeElement.chargePurposes.purposesUse')
    .modifyGraph('bills.billLicences.transactions.chargeElement.chargePurposes.purposesUse', (builder) => {
      builder.select([
        'description'
      ])
    })
}

/**
 * Masks an invoice account number by replacing the first 3 digits, for example, T88898349A becomes Z11898349A
 */
function _maskInvoiceAccountNumber (invoiceAccountNumber) {
  return `Z11${invoiceAccountNumber.substring(3)}`
}

/**
 * Masks an invoice number by replacing the first 2 digits, for example, TAI0000011T becomes ZZI0000011T
 */
function _maskInvoiceNumber (invoiceNumber) {
  return `ZZ${invoiceNumber.substring(2)}`
}

function _mockBills (bills) {
  bills.forEach((bill) => {
    const { address, name } = GenerateMockDataService.go()

    bill.accountAddress = address
    bill.contact = name

    bill.invoiceAccountNumber = _maskInvoiceAccountNumber(bill.invoiceAccountNumber)
    bill.invoiceNumber = _maskInvoiceNumber(bill.invoiceNumber)

    _mockBillLicences(bill.billLicences)
  })
}

function _mockBillLicences (billLicences) {
  billLicences.forEach((billLicence) => {
    const { name } = GenerateMockDataService.go()
    const { credit, debit, netTotal } = _transactionTotals(billLicence.transactions)

    billLicence.licenceHolder = name
    billLicence.credit = credit
    billLicence.debit = debit
    billLicence.netTotal = netTotal
  })
}

function _response (mockedBillRun) {
  return MockBillRunPresenter.go(mockedBillRun)
}

/**
 * Calculate the totals for a licence based on the transaction values
 *
 * We don't hold totals in the `billing_invoice_licence` record. But the UI shows them. We found it is calculating
 * these on the fly in the UI code so we need to replicate the same behaviour.
 *
 * Another thing to note is that if a transaction is flagged as a credit, then `netAmount` will be held as a signed
 * value, for example -213.40. This is why it might look confusing we are always adding on each iteration but the
 * calculation will be correct.
 * @param {*} transactions
 * @returns
 */
function _transactionTotals (transactions) {
  const values = {
    debit: 0,
    credit: 0,
    netTotal: 0
  }

  transactions.forEach((transaction) => {
    if (transaction.isCredit) {
      values.credit += transaction.netAmount
    } else {
      values.debit += transaction.netAmount
    }

    values.netTotal += transaction.netAmount
  })

  return values
}

module.exports = {
  go
}
