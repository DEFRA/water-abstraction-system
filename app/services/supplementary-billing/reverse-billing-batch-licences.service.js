'use strict'

/**
 * Takes a billing batch and licences and returns transactions which will reverse those licences on the billing batch
 * @module ReverseBillingBatchLicencesService
 */

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
  const transactions = await _fetchTransactions(billingBatch, licences)

  return transactions
}

/**
 * Fetches all transactions in the provided billing batch for the provided licences
 */
async function _fetchTransactions (billingBatch, licences) {
  const licenceIds = licences.map((licence) => {
    return licence.licenceId
  })

  return await BillingTransactionModel.query()
    .joinRelated('billingInvoiceLicence.billingInvoice')
    .whereIn('billingInvoiceLicence.licenceId', licenceIds)
    .where('billingBatchId', billingBatch.billingBatchId)
}

module.exports = {
  go
}
