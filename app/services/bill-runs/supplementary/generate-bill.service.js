'use strict'

/**
 * Generates a bill ready for persisting
 * @module GenerateBillService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

/**
 * Return a billing invoice object ready for persisting
 *
 * @param {module:BillingAccountModel} billingAccount The billing account this billing invoice will be linked to
 * @param {String} billRunId UUID of the bill run this bill will be linked to
 * @param {Number} financialYearEnding A value that must exist in the persisted record
 *
 * @returns {Object} The bill object ready to be persisted
 */
function go (billingAccount, billRunId, financialYearEnding) {
  const bill = {
    billingBatchId: billRunId,
    financialYearEnding,
    invoiceAccountId: billingAccount.id,
    billingInvoiceId: generateUUID(),
    address: {}, // Address is set to an empty object for SROC billing invoices
    invoiceAccountNumber: billingAccount.accountNumber,
    isCredit: false
  }

  return bill
}

module.exports = {
  go
}
