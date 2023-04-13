'use strict'

/**
 * Fetches the matching debit billing transactions from a previous billing batch and reverses them as credits
 * @module ProcessPreviousBillingTransactionsService
 */

const FetchPreviousBillingTransactionsService = require('./fetch-previous-billing-transactions.service.js')
const ReverseBillingTransactionsService = require('./reverse-billing-transactions.service.js')

/**
 * Fetches debit-only billing transactions from the previous billing batch for the invoice account and licence provided
 * then reverses them as credits
 *
 * @param {Object} billingInvoice A generated billing invoice that identifies the invoice account ID we need to match
 * against
 * @param {Object} billingInvoiceLicence A generated billing invoice licence  that identifies the licence we need to
 * match against. Also, has the billing invoice licence ID we'll be linked our reversed transactions to
 * @param {Object} billingPeriod Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Object[]} an array of matching Billing Transaction objects with new transaction IDs, the billing invoice
 * licence ID set to that passed in, and the `isCredit:` reversed to true
 */
async function go (billingInvoice, billingInvoiceLicence, billingPeriod) {
  const previousTransactions = await _fetchPreviousTransactions(billingInvoice, billingInvoiceLicence, billingPeriod)

  const reversedTransactions = ReverseBillingTransactionsService.go(previousTransactions, billingInvoiceLicence)

  return reversedTransactions
}

async function _fetchPreviousTransactions (billingInvoice, billingInvoiceLicence, billingPeriod) {
  const financialYearEnding = billingPeriod.endDate.getFullYear()

  const transactions = await FetchPreviousBillingTransactionsService.go(billingInvoice, billingInvoiceLicence, financialYearEnding)

  return transactions
}

module.exports = {
  go
}
