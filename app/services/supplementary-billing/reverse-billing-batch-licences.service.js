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

  const [licence] = licences
  const [billingInvoice] = billingInvoices

  const billingInvoiceLicences = await BillingInvoiceLicenceModel.query()
    .where({ billingInvoiceId: billingInvoice.billingInvoiceId })
    .where({ licenceId: licence.licenceId })

  const [billingInvoiceLicence] = billingInvoiceLicences

  const billingTransactions = await BillingTransactionModel.query()
    .where({ billingInvoiceLicenceId: billingInvoiceLicence.billingInvoiceLicenceId })

  return billingTransactions
}

module.exports = {
  go
}
