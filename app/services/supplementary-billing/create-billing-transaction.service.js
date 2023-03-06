'use strict'

/**
 * Persists a billing transaction in the db
 * @module CreateTransactionsService
 */

const BillingTransactionModel = require('../../models/water/billing-transaction.model.js')

/**
 * Persists a billing transaction in the db
 *
 * @param {Object} transaction Object containing the data to be persisted
 *
 * @returns {module:BillingTransactionModel} The newly created billing transaction instance
 */
async function go (transaction) {
  const billingTransaction = await BillingTransactionModel.query()
    .insert(transaction)
    .returning('*')

  return billingTransaction
}

module.exports = {
  go
}
