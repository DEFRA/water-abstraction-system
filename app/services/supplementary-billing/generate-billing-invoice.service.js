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
 * This first checks whether the invoice account ID of `currentBillingInvoice` matches the one passed to this service.
 * If it does, we return that instance.
 *
 * If it doesn't, we generate a new instance and return it.
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
 * @param {module:BillingInvoiceModel} currentBillingInvoice A billing invoice object
 * @param {String} invoiceAccountId UUID of the invoice account this billing invoice will be linked to if persisted
 * @param {String} billingBatchId UUID of the billing batch this billing invoice will be linked to if persisted
 * @param {Number} financialYearEnding A value that must exist in the persisted record
 *
 * @returns {Object} The current or newly-generated billing invoice object
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
