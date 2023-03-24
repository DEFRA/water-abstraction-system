'use strict'

/**
 * Generates a billing invoice record ready for persisting
 * @module GenerateBillingInvoiceService
 */

const { randomUUID } = require('crypto')

const InvoiceAccountModel = require('../../models/crm-v2/invoice-account.model.js')

/**
 * Return either a new billing invoice object ready for persisting or an existing one if it exists
 *
 * This first checks whether a billing invoice with the same invoice account ID exists in
 * `generatedBillingInvoices`. The calling service is expected to provide and keep track of this variable between
 * between calls. If it does, it returns that instance along with the original array unchanged.
 *
 * If it doesn't, we generate a new instance and create a new array, based on the one provided plus our new instance.
 * We then return the instance and the new array as the result.
 *
 * For context, this is all to avoid creating `billing_invoice` and `billing_invoice_licence` records unnecessarily.
 * The legacy service will create them first, then determine if there are any transactions to be billed. If there
 * aren't, it then has to go back and delete the records it created.
 *
 * Our intent is to only call the DB when we have records that need persisting. So, we start at the transaction level
 * and only persist `billing_invoice` and `billing_invoice_licence` records that are linked to billable transactions.
 * But to persist the billing transactions we need the foreign keys. So, we generate our billing invoice and billing
 * licence data in memory along with ID's, and use this service to provide the right record when persisting the
 * transaction.
 *
 * @param {Object[]} generatedBillingInvoices An array of previously generated billing invoice objects
 * @param {*} invoiceAccountId UUID of the invoice account this billing invoice will be linked to if persisted
 * @param {*} billingBatchId UUID of the billing batch this billing invoice will be linked to if persisted
 * @param {*} financialYearEnding a value that must exist in the persisted record
 *
 * @returns {Object} A result object containing either the found or generated billing invoice object, and an array of
 * generated billing invoices which includes the one being returned
 */
async function go (currentBillingInvoice, invoiceAccountId, billingBatchId, financialYearEnding) {
  if (currentBillingInvoice?.invoiceAccountId === invoiceAccountId) {
    return currentBillingInvoice
  }

  const invoiceAccount = await InvoiceAccountModel.query().findById(invoiceAccountId)

  const billingInvoice = {
    billingBatchId,
    financialYearEnding,
    invoiceAccountId,
    billingInvoiceId: randomUUID({ disableEntropyCache: true }),
    address: {}, // Address is set to an empty object for SROC billing invoices
    invoiceAccountNumber: invoiceAccount.invoiceAccountNumber,
    isCredit: false
  }

  return billingInvoice
}

module.exports = {
  go
}
