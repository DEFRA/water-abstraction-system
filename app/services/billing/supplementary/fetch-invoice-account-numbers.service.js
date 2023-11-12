'use strict'

/**
 * Fetches all invoice account numbers for the supplied charge versions
 * @module FetchInvoiceAccountNumbersService
 */

const BillingAccountModel = require('../../../models/crm-v2/billing-account.model.js')

/**
 * Fetch all invoice account numbers for the supplied charge versions
 *
 * @param {module:ChargeVersionModel[]} chargeVersions An array of charge versions
 *
 * @returns {Object[]} Array of objects in the format { invoiceAccountId: '...', invoiceAccountNumber: '...' }
 */
async function go (chargeVersions) {
  const uniqueInvoiceAccountIds = _extractUniqueInvoiceAccountIds(chargeVersions)
  const invoiceAccountModels = await _fetch(uniqueInvoiceAccountIds)

  // The results come back from Objection as InvoiceAccountModels. Since we want to be clear that these are not
  // full-blown models, we turn them into plain objects using Objection's .toJSON() method
  const invoiceAccountObjects = _makeObjects(invoiceAccountModels)

  return invoiceAccountObjects
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
  return BillingAccountModel.query()
    .select('invoiceAccountId', 'invoiceAccountNumber')
    .findByIds([...uniqueInvoiceAccountIds])
}

function _makeObjects (models) {
  return models.map(model => {
    return model.toJSON()
  })
}

module.exports = {
  go
}
