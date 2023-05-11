'use strict'

/**
 * Generates a billing invoice record ready for persisting
 * @module GenerateBillingInvoiceService
 */

const { randomUUID } = require('crypto')

/**
 * Return a billing invoice object ready for persisting
 *
 * @param {module:InvoiceAccountModel} invoiceAccount The invoice account this billing invoice will be linked to
 * @param {String} billingBatchId UUID of the billing batch this billing invoice will be linked to
 * @param {Number} financialYearEnding A value that must exist in the persisted record
 *
 * @returns {Object} The billing invoice object ready to be persisted
 */
function go (invoiceAccount, billingBatchId, financialYearEnding) {
  const billingInvoice = {
    billingBatchId,
    financialYearEnding,
    invoiceAccountId: invoiceAccount.invoiceAccountId,
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
