'use strict'

/**
 * Fetches matching debit transactions from previous bill runs, then compares them as credits to those just generated
 * @module ProcessSupplementaryTransactionsService
 */

const FetchPreviousTransactionsService = require('./fetch-previous-transactions.service.js')
const { transactionsMatch } = require('../../lib/general.lib.js')
const ReverseTransactionsService = require('./reverse-supplementary-transactions.service.js')

/**
 * Fetches matching debit transactions from previous bill runs, then compares them as credits to those just generated
 *
 * The `FetchPreviousTransactionsService` finds _all_ previous debit and credit transactions. It then compares the
 * debits to the credits. If they match, the debit transaction is dropped. This is because it must have been dealt with
 * by a previous supplementary bill run.
 *
 * Any debits that remain are then reversed as credits. These are then compared against the ones we've generated for the
 * bill run in progress.
 *
 * If any matches occur here, both transactions are dropped. There is no point in sending them to the Charging Module
 * API and including them in the bill, as the result will just be £0, and we've been asked to limit zero-value bills
 * where we can.
 *
 * Any generated transactions and reversed debits (now credits) that didn't match are returned as the transactions to be
 * sent to the Charging Module API, and included in the bill.
 *
 * @param {object[]} generatedTransactions - The generated transactions for the bill licence being processed
 * @param {string} billLicenceId - The UUID that will be used for the bill licence we are processing transactions for
 * @param {string} billingAccountId - The UUID for the billing account we are processing transactions for and for which
 * we need to fetch previous transactions
 * @param {string} licenceId - The UUID for the licence we are processing transactions for and  and for which we need to
 * fetch previous transactions
 * @param {number} financialYearEnding - Which financial year to look for previous transactions in
 *
 * @returns {Promise<object[]>} An array of the remaining generated transactions and reversed debits from previous
 * transactions (ie. those which were not cancelled out when the generated and reversed were compared)
 */
async function go(generatedTransactions, billLicenceId, billingAccountId, licenceId, financialYearEnding) {
  const previousTransactions = await FetchPreviousTransactionsService.go(
    billingAccountId,
    licenceId,
    financialYearEnding
  )

  if (previousTransactions.length === 0) {
    return generatedTransactions
  }

  const reversedTransactions = ReverseTransactionsService.go(previousTransactions, billLicenceId)

  return _cleanseTransactions(generatedTransactions, reversedTransactions)
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
function _cancelCalculatedTransaction(calculatedTransaction, reversedTransactions) {
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
function _cleanseTransactions(calculatedTransactions, reverseTransactions) {
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

module.exports = {
  go
}
