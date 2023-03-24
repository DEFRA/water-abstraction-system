'use strict'

/**
 * Takes previously billed transactions and returns reversed and cleansed versions of them
 * @module ReverseBillingTransactionsService
 */

const { randomUUID } = require('crypto')

/**
 * Takes an array of transactions and returns an array of transactions which will reverse them.
 *
 * In some situations we need to "reverse" transactions; this is done by issuing new transactions which cancel them out.
 * This service takes an array of transactions and a billing invoice licence, and returns an array of transactions which
 * will reverse the original transactions, with their billing invoice licence id set to the id of the supplied billing
 * invoice licence.
 *
 * @param {Array[module:BillingTransactionModel]} transactions Array of transactions to be reversed
 * @param {module:BillingInvoiceLicenceModel} billingInvoiceLicence The billing invoice licence these transactions are
 *  intended to be added to
 *
 * @returns {Array[Object]} Array of reversing transactions with `billingInvoiceLicenceId` set to the id of the supplied
 *  `billingInvoiceLicence`
 */
function go (transactions, billingInvoiceLicence) {
  return _reverseTransactions(transactions, billingInvoiceLicence)
}

/**
 * Receives an array of debit transactions and returns transactions that will reverse them. These transactions are
 * identical except the `isCredit` flag is set to 'true', the status is set to `candidate`, the
 * `billingInvoiceLicenceId` is set to the id of the supplied billing invoice licence, and a new `billingTransactionId`
 * is generated.
 */
function _reverseTransactions (transactions, billingInvoiceLicence) {
  return transactions.map((transaction) => {
    // TODO: The FetchBillingTransactionsService which we use to get the transactions to reverse adds the invoice
    // account ID and number to each transaction returned. This is a performance measure to avoid an extra query to the
    // DB. But if we don't strip them from the result when we try to persist our reversed versions, they fail because
    // the billing_transactions table doesn't have these fields. We do the stripping here to avoid iterating through
    // the collection multiple times. Ideally, we'd look to return a result from FetchBillingTransactionsService that
    // avoids us having to do this.
    const { invoiceAccountId, invoiceAccountNumber, ...propertiesToKeep } = transaction

    return {
      ...propertiesToKeep,
      billingTransactionId: _generateUuid(),
      billingInvoiceLicenceId: billingInvoiceLicence.billingInvoiceLicenceId,
      isCredit: true,
      status: 'candidate',
      // TODO: Our query result seems to return the transaction's `purposes:` property as [Object]. Clearly, we need
      // to re-jig something or give Knex some more instructions on dealing with this JSONB field. But just to prove
      // the process is working we use this service to deal with the issue and extract the JSON from the array we've
      // been provided.
      purposes: transaction.purposes[0]
    }
  })
}

function _generateUuid () {
  // We set `disableEntropyCache` to `false` as normally, for performance reasons node caches enough random data to
  // generate up to 128 UUIDs. We disable this as we may need to generate more than this and the performance hit in
  // disabling this cache is a rounding error in comparison to the rest of the process.
  //
  // https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
  return randomUUID({ disableEntropyCache: true })
}

module.exports = {
  go
}
