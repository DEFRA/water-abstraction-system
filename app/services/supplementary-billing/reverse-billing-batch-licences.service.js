'use strict'

/**
 * Takes some transactions and returns transactions which will reverse them
 * @module ReverseBillingBatchLicencesService
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
async function go (transactions, billingInvoiceLicence) {
  return _reverseTransactions(transactions, billingInvoiceLicence)
}

/**
 * Receives an array of transactions and returns transactions that will reverse them. These transactions are identical
 * except the `isCredit` flag is flipped (eg. if a debit is to be reversed then a credit is returned), the status is set
 * to `candidate`, and the `billingInvoiceLicenceId` is set to the id of the supplied billing invoice licence.
 */
function _reverseTransactions (transactions, billingInvoiceLicence) {
  return transactions.map((transaction) => {
    return {
      ...transaction,
      billingTransactionId: _generateUuid(),
      billingInvoiceLicenceId: billingInvoiceLicence.billingInvoiceLicenceId,
      isCredit: !transaction.isCredit,
      status: 'candidate'
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
