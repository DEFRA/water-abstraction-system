'use strict'

/**
 * Fetches all invoice accounts for the supplied charge versions
 * @module FetchInvoiceAccountsService
 */

const InvoiceAccountModel = require('../../models/crm-v2/invoice-account.model.js')

/**
 * Fetch all invoice accounts for the supplied charge versions
 *
 * @param {module:ChargeVersionModel[]} chargeVersions An array of charge versions
 *
 * @returns {module:InvoiceAccountModel[]} An array of matching invoice accounts
 */
async function go (chargeVersions) {
  const uniqueInvoiceAccountIds = _extractUniqueInvoiceAccountIds(chargeVersions)

  const invoiceAccounts = await _fetch(uniqueInvoiceAccountIds)

  return invoiceAccounts
}

function _extractUniqueInvoiceAccountIds (chargeVersions) {
  const allInvoiceAccountIds = chargeVersions.map((chargeVersion) => {
    return chargeVersion.invoiceAccountId
  })

  // Creating a new set from allInvoiceAccountIds gives us just the unique ids. Objection does not accept sets in
  // .findByIds() so we spread it into an array
  return [...new Set(allInvoiceAccountIds)]
}

function _fetch (uniqueInvoiceAccountIds) {
  return InvoiceAccountModel.query().findByIds([...uniqueInvoiceAccountIds])
}

module.exports = {
  go
}
