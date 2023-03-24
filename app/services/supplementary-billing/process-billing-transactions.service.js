'use strict'

const FetchPreviousBillingTransactionsService = require('./fetch-previous-billing-transactions.service.js')
const ReverseBillingTransactionsService = require('./reverse-billing-transactions.service.js')

async function go (calculatedTransactions, billingInvoice, billingInvoiceLicence, billingPeriod) {
  const previousTransactions = await _fetchPreviousTransactions(billingInvoice, billingInvoiceLicence, billingPeriod)

  if (previousTransactions.length === 0) {
    return calculatedTransactions
  }

  const reversedTransactions = ReverseBillingTransactionsService.go(previousTransactions, billingInvoiceLicence)

  return _cleanseTransactions(calculatedTransactions, reversedTransactions)
}

function _cancelCalculatedTransaction (calculatedTransaction, reversedTransactions) {
  const result = reversedTransactions.findIndex((reversedTransaction) => {
    // Example of the things we are comparing
    // - chargeType - standard or compensation
    // - chargeCategory - 4.10.1
    // - billableDays - 215
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
 * same values) but with opposing credit flags -- in other words, a credit and a debit which cancel each other out.
 */
function _cleanseTransactions (calculatedTransactions, reverseTransactions) {
  const cleansedTransactionLines = []

  for (const calculatedTransactionLine of calculatedTransactions) {
    if (!_cancelCalculatedTransaction(calculatedTransactionLine, reverseTransactions)) {
      cleansedTransactionLines.push(calculatedTransactionLine)
    }
  }

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
