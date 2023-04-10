'use strict'

const FetchPreviousBillingTransactionsService = require('./fetch-previous-billing-transactions.service.js')
const ReverseBillingTransactionsService = require('./reverse-billing-transactions.service.js')

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
