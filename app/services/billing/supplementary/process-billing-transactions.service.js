'use strict'

/**
 * Fetches the matching debit billing transactions from a previous bill run and reverses them as credits; removes
 * any which would be cancelled out by the supplied calculated debit transactions; combines the remaining transactions
 * and returns them all
 * @module ProcessBillingTransactionsService
 */

const FetchPreviousBillingTransactionsService = require('./fetch-previous-billing-transactions.service.js')
const ReverseBillingTransactionsService = require('./reverse-billing-transactions.service.js')

/**
 * Fetches debit-only billing transactions from the previous bill run for the invoice account and licence provided
 * and reverses them as credits. These credits are compared with the supplied calculated debit transactions (ie. debit
 * transactions which are to be sent to the Charging Module) and any matching pairs of transactions which would cancel
 * each other out are removed. Any remaining reversed credits and calculated debits are returned.
 *
 * @param {Object[]} calculatedTransactions The calculated transactions to be processed
 * @param {Object} bill A generated bill that identifies the invoice account ID we need to match against
 * @param {Object} billLicence A generated bill licence that identifies the licence we need to match against
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Object[]} An array of the remaining calculated transactions (ie. those which were not cancelled out by a
 *  previous matching credit)
 */
async function go (calculatedTransactions, bill, billLicence, billingPeriod) {
  const previousTransactions = await _fetchPreviousTransactions(bill, billLicence, billingPeriod)

  if (previousTransactions.length === 0) {
    return calculatedTransactions
  }

  const reversedTransactions = ReverseBillingTransactionsService.go(previousTransactions, billLicence)

  return _cleanseTransactions(calculatedTransactions, reversedTransactions)
}

/**
 * Compares a calculated transaction to the transactions from previous bill runs
 *
 * Takes a single calculated debit transaction and checks to see if the provided array of reversed (credit) transactions
 * contains a transaction that will cancel it out, returning `true` or `false` to indicate if it does or doesn't.
 *
 * We compare those properties which determine the charge value calculated by the charging module. If the calculated
 * transaction's properties matches one in reversedTransactions we return true. This will tell the calling method
 * to not include the calculated transaction in the bill run. We also remove the matched transaction from
 * reversedTransactions.
 *
 * The key properties are charge type, category code, and billable days. But we also need to compare agreements and
 * additional charges because if those have changed, we'll need to credit the previous transaction and calculate the
 * new debit value. Because what we are checking does not match up to what you see in the UI we have this reference
 *
 * - Abatement agreement - section126Factor
 * - Two-part tariff agreement - section127Agreement
 * - Canal and River Trust agreement - section130Agreement
 * - Aggregate - aggregateFactor
 * - Charge Adjustment - adjustmentFactor
 * - Winter discount - isWinterOnly
 *
 * - Additional charges - isSupportedSource
 * - Additional charges - supportedSourceName
 * - Additional charges - isWaterCompanyCharge
 *
 * NOTE: This function will mutate the provided array of reversed transactions if one of the transactions in it will
 * cancel the calculated transaction; in this case, we remove the reversed transaction from the array as it can only
 * cancel one calculated transaction.
 */
function _cancelCalculatedTransaction (calculatedTransaction, reversedTransactions) {
  // When we put together this matching logic our instincts were to try and do something 'better' than this long,
  // chained && statement. But whatever we came up with was
  // - more complex
  // - less performant
  // We found this easy to see what properties are being compared. Plus the moment something doesn't match we bail. So,
  // much as it feels 'wrong', we are sticking with it!
  const result = reversedTransactions.findIndex((reversedTransaction) => {
    return reversedTransaction.chargeType === calculatedTransaction.chargeType &&
      reversedTransaction.chargeCategoryCode === calculatedTransaction.chargeCategoryCode &&
      reversedTransaction.billableDays === calculatedTransaction.billableDays &&
      reversedTransaction.section126Factor === calculatedTransaction.section126Factor &&
      reversedTransaction.section127Agreement === calculatedTransaction.section127Agreement &&
      reversedTransaction.section130Agreement === calculatedTransaction.section130Agreement &&
      reversedTransaction.aggregateFactor === calculatedTransaction.aggregateFactor &&
      reversedTransaction.adjustmentFactor === calculatedTransaction.adjustmentFactor &&
      reversedTransaction.isWinterOnly === calculatedTransaction.isWinterOnly &&
      reversedTransaction.isSupportedSource === calculatedTransaction.isSupportedSource &&
      reversedTransaction.supportedSourceName === calculatedTransaction.supportedSourceName &&
      reversedTransaction.isWaterCompanyCharge === calculatedTransaction.isWaterCompanyCharge
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

async function _fetchPreviousTransactions (bill, billLicence, billingPeriod) {
  const financialYearEnding = billingPeriod.endDate.getFullYear()

  const transactions = await FetchPreviousBillingTransactionsService.go(bill, billLicence, financialYearEnding)

  return transactions
}

module.exports = {
  go
}
