'use strict'

/**
 * Generates a mock bill run based on a real one
 * @module GenerateBillRunService
 */

const BillingBatchModel = require('../../../models/water/billing-batch.model.js')
const GenerateMockDataService = require('./generate-mock-data.service.js')
const MockBillRunPresenter = require('../../../presenters/data/mock-bill-run.presenter.js')

async function go (id) {
  const realBillingBatch = await _fetchBillingBatch(id)

  if (!realBillingBatch) {
    throw new Error('No matching bill run exists')
  }

  const mockedBillingBatch = _mockBillingBatch(realBillingBatch)

  return _response(mockedBillingBatch)
}

async function _fetchBillingBatch (id) {
  return BillingBatchModel.query()
    .findById(id)
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'name'
      ])
    })
    .withGraphFetched('billingInvoices')
    .modifyGraph('billingInvoices', (builder) => {
      builder.select([
        'billingInvoiceId',
        'creditNoteValue',
        'invoiceAccountNumber',
        'invoiceNumber',
        'invoiceValue',
        'netAmount'
      ])
    })
    .withGraphFetched('billingInvoices.billingInvoiceLicences')
    .modifyGraph('billingInvoices.billingInvoiceLicences', (builder) => {
      builder.select([
        'billingInvoiceLicenceId',
        'licenceRef'
      ])
    })
    .withGraphFetched('billingInvoices.billingInvoiceLicences.licence')
    .modifyGraph('billingInvoices.billingInvoiceLicences.licence', (builder) => {
      builder.select([
        'isWaterUndertaker'
      ])
    })
    .withGraphFetched('billingInvoices.billingInvoiceLicences.billingTransactions')
    .modifyGraph('billingInvoices.billingInvoiceLicences.billingTransactions', (builder) => {
      builder.select([
        'chargeType',
        'billableDays',
        'authorisedDays',
        'isCredit',
        'netAmount',
        'billableQuantity',
        'description',
        'startDate',
        'endDate',
        'chargeCategoryCode',
        'grossValuesCalculated',
        'chargeCategoryDescription'
      ])
    })
    .withGraphFetched('billingInvoices.billingInvoiceLicences.billingTransactions.chargeElement')
    .modifyGraph('billingInvoices.billingInvoiceLicences.billingTransactions.chargeElement', (builder) => {
      builder.select([
        'adjustments'
      ])
    })
    .withGraphFetched('billingInvoices.billingInvoiceLicences.billingTransactions.chargeElement.chargePurposes')
    .modifyGraph('billingInvoices.billingInvoiceLicences.billingTransactions.chargeElement.chargePurposes', (builder) => {
      builder.select([
        'chargePurposeId',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'authorisedAnnualQuantity'
      ])
    })
    .withGraphFetched('billingInvoices.billingInvoiceLicences.billingTransactions.chargeElement.chargePurposes.purposesUse')
    .modifyGraph('billingInvoices.billingInvoiceLicences.billingTransactions.chargeElement.chargePurposes.purposesUse', (builder) => {
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

function _mockBillingBatch (billingBatch) {
  _mockBillingInvoices(billingBatch.billingInvoices)
}

function _mockBillingInvoices (billingInvoices) {
  billingInvoices.forEach((billingInvoice) => {
    const {
      address: accountAddress,
      name: contact
    } = GenerateMockDataService.go()

    billingInvoice.address = accountAddress
    billingInvoice.contact = contact

    billingInvoice.invoiceAccountNumber = _maskInvoiceAccountNumber(billingInvoice.invoiceAccountNumber)
    billingInvoice.invoiceNumber = _maskInvoiceNumber(billingInvoice.invoiceNumber)

    _mockBillingInvoiceLicences(billingInvoice.billingInvoiceLicences)
  })
}

function _mockBillingInvoiceLicences (billingInvoiceLicences) {
  billingInvoiceLicences.forEach((billingInvoiceLicence) => {
    const { name: licenceHolder } = GenerateMockDataService.go()
    const transactionTotals = _transactionTotals(billingInvoiceLicence.billingTransactions)

    billingInvoiceLicence.licenceHolder = licenceHolder
    billingInvoiceLicence.credit = transactionTotals.credit
    billingInvoiceLicence.debit = transactionTotals.debit
    billingInvoiceLicence.netTotal = transactionTotals.netTotal
  })
}

function _response (mockedBillingBatch) {
  return MockBillRunPresenter.go(mockedBillingBatch)
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
