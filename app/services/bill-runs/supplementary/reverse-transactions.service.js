'use strict'

/**
 * Takes previously billed transactions and returns reversed and cleansed versions of them
 * @module ReverseTransactionsService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

/**
 * Takes an array of transactions and returns an array of transactions which will reverse them.
 *
 * In some situations we need to "reverse" transactions; this is done by issuing new transactions which cancel them out.
 * This service takes an array of transactions and a bill licence, and returns an array of transactions which
 * will reverse the original transactions, with their bill licence id set to the id of the supplied billing licence.
 *
 * @param {module:TransactionModel[]} transactions Array of transactions to be reversed
 * @param {module:BillLicenceModel} billLicence The bill licence these transactions are intended to be added to
 *
 * @returns {Object[]} Array of reversing transactions with `billLicenceId` set to the id of the supplied
 *  `billLicence`
 */
function go (transactions, billLicence) {
  return _reverseTransactions(transactions, billLicence)
}

/**
 * Receives an array of debit transactions and returns transactions that will reverse them. These transactions are
 * identical except the `credit` flag is set to 'true', the status is set to `candidate`, the `billLicenceId` is set
 * to the id of the supplied bill licence, and a new transaction ID is generated.
 */
function _reverseTransactions (transactions, billLicence) {
  return transactions.map((transaction) => {
    // TODO: The FetchTransactionsService which we use to get the transactions to reverse adds the billing account ID
    // and number to each transaction returned. This is a performance measure to avoid an extra query to the DB. But if
    // we don't strip them from the result when we try to persist our reversed versions, they fail because the
    // transactions table doesn't have these fields. We do the stripping here to avoid iterating through the
    // collection multiple times. Ideally, we'd look to return a result from FetchTransactionsService that avoids us
    // having to do this.
    const { billingAccountId, accountNumber, ...propertiesToKeep } = transaction

    return {
      ...propertiesToKeep,
      id: generateUUID(),
      billLicenceId: billLicence.id,
      credit: true,
      status: 'candidate',
      // TODO: Our query result seems to return the transaction's `purposes:` property as [Object]. Clearly, we need
      // to re-jig something or give Knex some more instructions on dealing with this JSONB field. But just to prove
      // the process is working we use this service to deal with the issue and extract the JSON from the array we've
      // been provided.
      purposes: transaction.purposes[0]
    }
  })
}

module.exports = {
  go
}
