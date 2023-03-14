'use strict'

/**
 * Takes a billing batch and licences and returns transactions which will reverse those licences on the billing batch
 * @module ReverseBillingBatchLicencesService
 */

const BillingInvoiceModel = require('../../models/water/billing-invoice.model.js')
const BillingInvoiceLicenceModel = require('../../models/water/billing-invoice-licence.model.js')
const BillingTransactionModel = require('../../models/water/billing-transaction.model.js')

/**
 * TODO: document
 *
 * @param {module:BillingBatchModel} billingBatch The billing batch we want to look for the licences
 * @param {Array[]} licences An array of licences to look for in the billing batch
 *
 * @returns {Array[]} Array of reversing transactions
 */
async function go (billingBatch, licences) {
  const transactions = await _getTransactions(billingBatch, licences)

  return transactions
}

async function _getTransactions (billingBatch, licences) {
  const billingInvoices = await BillingInvoiceModel.query()
    .where({ billingBatchId: billingBatch.billingBatchId })

  const licenceIds = licences.map(licence => licence.licenceId)
  const billingInvoiceIds = billingInvoices.map(invoices => invoices.billingInvoiceId)

  const billingInvoiceLicences = await BillingInvoiceLicenceModel.query()
    .whereIn('billingInvoiceId', billingInvoiceIds)
    .whereIn('licenceId', licenceIds)

  const billingInvoiceLicenceIds = billingInvoiceLicences.map(licence => licence.billingInvoiceLicenceId)

  const billingTransactions = await BillingTransactionModel.query()
    .whereIn('billingInvoiceLicenceId', billingInvoiceLicenceIds)

  return billingTransactions
}

module.exports = {
  go
}
