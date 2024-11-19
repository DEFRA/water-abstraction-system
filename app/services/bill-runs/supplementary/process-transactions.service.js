'use strict'

/**
 * Fetches the matching debit transactions from a previous bill run and reverses them as credits
 * @module ProcessTransactionsService
 */

const FetchPreviousTransactionsService = require('./fetch-previous-transactions.service.js')
const { transactionsMatch } = require('../../../lib/general.lib.js')
const ReverseTransactionsService = require('./reverse-transactions.service.js')

/**
 * Fetches debit-only transactions from the previous bill run for the billing account and licence provided and reverses
 * them as credits.
 *
 * These credits are compared with the supplied calculated debit transactions (ie. debit transactions which are to be
 * sent to the Charging Module) and any matching pairs of transactions which would cancel each other out are removed.
 * Any remaining reversed credits and calculated debits are returned.
 *
 * @param {object[]} calculatedTransactions - The calculated transactions to be processed
 * @param {string} billingAccountId - The UUID that identifies the billing account we are processing transactions for
 * @param {object} billLicence - A generated bill licence that identifies the licence we need to match against
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<object[]>} An array of the remaining calculated transactions (ie. those which were not cancelled
 * out by a previous matching credit)
 */
async function go (calculatedTransactions, billingAccountId, billLicence, billingPeriod) {
  const { id: billLicenceId, licenceId } = billLicence
  const previousTransactions = await _fetchPreviousTransactions(billingAccountId, licenceId, billingPeriod)

  if (previousTransactions.length === 0) {
    return calculatedTransactions
  }

  const reversedTransactions = ReverseTransactionsService.go(previousTransactions, billLicenceId)

  return _cleanseTransactions(calculatedTransactions, reversedTransactions)
}

/**
 * Compares a calculated transaction to the transactions from previous bill runs
 *
 * Takes a single calculated debit transaction and checks to see if the provided array of reversed (credit) transactions
 * contains a transaction that will cancel it out, returning `true` or `false` to indicate if it does or doesn't.
 *
 * NOTE: This function will mutate the provided array of reversed transactions if one of the transactions in it will
 * cancel the calculated transaction; in this case, we remove the reversed transaction from the array as it can only
 * cancel one calculated transaction.
 *
 * @private
 */
function _cancelCalculatedTransaction (calculatedTransaction, reversedTransactions) {
  const result = reversedTransactions.findIndex((reversedTransaction) => {
    return transactionsMatch(reversedTransaction, calculatedTransaction)
  })

  if (result === -1) {
    return false
  }

  reversedTransactions.splice(result, 1)

  return true
}

/**
 * Remove any "cancelling pairs" of transaction lines. We define a "cancelling pair" as a pair of transactions belonging
 * to the same bill licence which would send the same data to the Charging Module (and therefore return the same values)
 * but with opposing credit flags -- in other words, a credit and a debit which cancel each other out. All remaining
 * transactions (both calculated transactions and reverse transactions) are returned.
 *
 * @private
 */
function _cleanseTransactions (calculatedTransactions, reverseTransactions) {
  const cleansedTransactionLines = []

  // Iterate over each calculated transaction to see if a transaction in the reverse transactions would form a
  // "cancelling pair" with it. If not then add the unpaired calculated transaction to our array of cleansed transaction
  // lines. Note that `reverseTransactions` will be mutated to remove any reverse transactions which form a cancelling
  // pair.
  calculatedTransactions.forEach((calculatedTransactionLine) => {
    if (!_cancelCalculatedTransaction(calculatedTransactionLine, reverseTransactions)) {
      cleansedTransactionLines.push(calculatedTransactionLine)
    }
  })

  // Add the remaining reverse transactions (ie. those which didn't form a cancelling pair)
  cleansedTransactionLines.push(...reverseTransactions)

  return cleansedTransactionLines
}

async function _fetchPreviousTransactions (billingAccountId, licenceId, billingPeriod) {
  const financialYearEnding = billingPeriod.endDate.getFullYear()

  const transactions = await FetchPreviousTransactionsService.go(billingAccountId, licenceId, financialYearEnding)

  return transactions
}

module.exports = {
  go
}
