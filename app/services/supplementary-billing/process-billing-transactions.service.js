'use strict'

/**
 * Fetches the matching debit billing transactions from a previous billing batch and reverses them as credits; removes
 * any which would be cancelled out by the supplied calculated debit transactions; combines the remaining transactions
 * and returns them all
 * @module ProcessBillingTransactionsService
 */

const FetchPreviousBillingTransactionsService = require('./fetch-previous-billing-transactions.service.js')
const ReverseBillingTransactionsService = require('./reverse-billing-transactions.service.js')

/**
 * Fetches debit-only billing transactions from the previous billing batch for the invoice account and licence provided
 * and reverses them as credits. These credits are compared with the supplied calculated debit transactions (ie. debit
 * transactions which are to be sent to the Charging Module) and any matching pairs of transactions which would cancel
 * each other out are removed. Any remaining reversed credits and calculated debits are returned.
 *
 * @param {Object[]} calculatedTransactions The calculated transactions to be processed
 * @param {Object} billingInvoice A generated billing invoice that identifies the invoice account ID we need to match
 *  against
 * @param {Object} billingInvoiceLicence A generated billing invoice licence that identifies the licence we need to
 *  match against
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Object[]} An array of the remaining calculated transactions (ie. those which were not cancelled out by a
 *  previous matching credit)
 */
async function go (calculatedTransactions, billingInvoice, billingInvoiceLicence, billingPeriod) {
  const previousTransactions = await _fetchPreviousTransactions(billingInvoice, billingInvoiceLicence, billingPeriod)

  if (previousTransactions.length === 0) {
    return calculatedTransactions
  }

  const reversedTransactions = ReverseBillingTransactionsService.go(previousTransactions, billingInvoiceLicence)

  return _cleanseTransactions(calculatedTransactions, reversedTransactions)
}

/**
 * Takes a single calculated debit transaction and checks to see if the provided array of reversed (credit) transactions
 * contains a transaction that will cancel it out, returning `true` or `false` to indicate if it does or doesn't. Since
 * the calculated debit transactions have not yet been sent to the Charging Module, we look at `chargeType`,
 * `chargeCategoryCode` and `billableDays` as any given combination of these will always result in the same value coming
 * back from the Charging Module.
 *
 * NOTE: This function will mutate the provided array of reversed transactions if one of the transactions in it will
 * cancel the calculated transaction; in this case, we remove the reversed transaction from the array as it can only
 * cancel one calculated transaction.
 */
function _cancelCalculatedTransaction (calculatedTransaction, reversedTransactions) {
  const result = reversedTransactions.findIndex((reversedTransaction) => {
    return reversedTransaction.chargeType === calculatedTransaction.chargeType &&
      reversedTransaction.chargeCategoryCode === calculatedTransaction.chargeCategoryCode &&
      reversedTransaction.billableDays === calculatedTransaction.billableDays
  })

  if (result === -1) {
    return false
  }

  reversedTransactions.splice(result, 1)

  return true
}

/**
 * Remove any "cancelling pairs" of transaction lines. We define a "cancelling pair" as a pair of transactions belonging
 * to the same billing invoice licence which would send the same data to the Charging Module (and therefore return the
 * same values) but with opposing credit flags -- in other words, a credit and a debit which cancel each other out. All
 * remaining transactions (both calculated transactions and reverse transactions) are returned.
 */
function _cleanseTransactions (calculatedTransactions, reverseTransactions) {
  const cleansedTransactionLines = []

  // Iterate over each calculated transaction to see if a transaction in the reverse transactions would form a
  // "cancelling pair" with it. If not then add the unpaired calculated transaction to our array of cleansed transaction
  // lines. Note that `reverseTransactions` will be mutated to remove any reverse transactions which form a cancelling
  // pair.
  for (const calculatedTransactionLine of calculatedTransactions) {
    if (!_cancelCalculatedTransaction(calculatedTransactionLine, reverseTransactions)) {
      cleansedTransactionLines.push(calculatedTransactionLine)
    }
  }

  // Add the remaining reverse transactions (ie. those which didn't form a cancelling pair)
  cleansedTransactionLines.push(...reverseTransactions)

  return cleansedTransactionLines
}

async function _fetchPreviousTransactions (billingInvoice, billingInvoiceLicence, billingPeriod) {
  const financialYearEnding = billingPeriod.endDate.getFullYear()

  const transactions = await FetchPreviousBillingTransactionsService.go(billingInvoice, billingInvoiceLicence, financialYearEnding)

  return transactions
}

module.exports = {
  go
}
