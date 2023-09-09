'use strict'

/**
 * Generates a billing invoice record ready for persisting
 * @module GenerateBillingInvoiceService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

/**
 * Return a billing invoice object ready for persisting
 *
 * @param {module:InvoiceAccountModel} invoiceAccount The invoice account this billing invoice will be linked to
 * @param {String} billRunId UUID of the bill run this billing invoice will be linked to
 * @param {Number} financialYearEnding A value that must exist in the persisted record
 *
 * @returns {Object} The billing invoice object ready to be persisted
 */
function go (invoiceAccount, billRunId, financialYearEnding) {
  const billingInvoice = {
    billingBatchId: billRunId,
    financialYearEnding,
    invoiceAccountId: invoiceAccount.invoiceAccountId,
    billingInvoiceId: generateUUID(),
    address: {}, // Address is set to an empty object for SROC billing invoices
    invoiceAccountNumber: invoiceAccount.invoiceAccountNumber,
    isCredit: false
  }

  return billingInvoice
}

module.exports = {
  go
}
