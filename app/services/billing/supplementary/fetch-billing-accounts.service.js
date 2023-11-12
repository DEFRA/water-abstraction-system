'use strict'

/**
 * Fetches all billing accounts for the supplied charge versions
 * @module FetchBillingAccountsService
 */

const BillingAccountModel = require('../../../models/crm-v2/billing-account.model.js')

/**
 * Fetch all billing accounts for the supplied charge versions
 *
 * @param {module:ChargeVersionModel[]} chargeVersions An array of charge versions
 *
 * @returns {Object[]} Array of objects in the format { invoiceAccountId: '...', invoiceAccountNumber: '...' }
 */
async function go (chargeVersions) {
  const uniqueInvoiceAccountIds = _extractUniqueInvoiceAccountIds(chargeVersions)
  const billingAccountModels = await _fetch(uniqueInvoiceAccountIds)

  // The results come back from Objection as BillingAccountModels. Since we want to be clear that these are not
  // full-blown models, we turn them into plain objects using Objection's .toJSON() method
  const billingAccountObjects = _makeObjects(billingAccountModels)

  return billingAccountObjects
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
