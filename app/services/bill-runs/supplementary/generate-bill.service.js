'use strict'

/**
 * Generates a bill ready for persisting
 * @module GenerateBillService
 */

const { generateUUID } = require('../../../lib/general.lib.js')

/**
 * Return a bill object ready for persisting
 *
 * @param {module:BillingAccountModel} billingAccount The billing account this bill will be linked to
 * @param {String} billRunId UUID of the bill run this bill will be linked to
 * @param {Number} financialYearEnding A value that must exist in the persisted record
 *
 * @returns {Object} The bill object ready to be persisted
 */
function go (billingAccount, billRunId, financialYearEnding) {
  const bill = {
    id: generateUUID(),
    accountNumber: billingAccount.accountNumber,
    address: {}, // Address is set to an empty object for SROC billing invoices
    billingAccountId: billingAccount.id,
    billRunId,
    credit: false,
    financialYearEnding
  }

  return bill
}

module.exports = {
  go
}
