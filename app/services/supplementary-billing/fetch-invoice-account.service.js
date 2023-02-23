'use strict'

/**
 * Fetches an `invoiceAccount` record based on the `invoiceAccountId` provided
 * @module FetchInvoiceAccountService
 */

const InvoiceAccountModel = require('../../models/crm-v2/invoice-account.model.js')

/**
 * Fetches the `invoiceAccount` with the matching `invoiceAccountId`
 *
 * @param {string} invoiceAccountId The ID of the `invoiceAccount` to be retrieved
 *
 * @returns {Object} Instance of `InvoiceAccountModel` with the matching `invoiceAccountId`
 */
async function go (invoiceAccountId) {
  const invoiceAccount = await _fetch(invoiceAccountId)

  return invoiceAccount
}

async function _fetch (invoiceAccountId) {
  const result = await InvoiceAccountModel.query()
    .where('invoiceAccountId', invoiceAccountId)
    .first()

  return result
}

module.exports = {
  go
}
