'use strict'

/**
 * Fetches all billing accounts for the supplied charge versions
 * @module FetchBillingAccountsService
 */

const BillingAccountModel = require('../../../models/billing-account.model.js')

/**
 * Fetch all billing accounts for the supplied charge versions
 *
 * @param {module:ChargeVersionModel[]} chargeVersions - An array of charge versions
 *
 * @returns {Promise<object[]>} Array of objects in the format { billingAccountId: '...', accountNumber: '...' }
 */
async function go(chargeVersions) {
  const uniqueBillingAccountIds = _extractUniqueBillingAccountIds(chargeVersions)
  const billingAccountModels = await _fetch(uniqueBillingAccountIds)

  // The results come back from Objection as BillingAccountModels. Since we want to be clear that these are not
  // full-blown models, we turn them into plain objects using Objection's .toJSON() method
  const billingAccountObjects = _makeObjects(billingAccountModels)

  return billingAccountObjects
}

function _extractUniqueBillingAccountIds(chargeVersions) {
  const allBillingAccountIds = chargeVersions.map((chargeVersion) => {
    return chargeVersion.billingAccountId
  })

  // Creating a new set from allBillingAccountIds gives us just the unique ids. Objection does not accept sets in
  // .findByIds() so we spread it into an array
  return [...new Set(allBillingAccountIds)]
}

function _fetch(uniqueBillingAccountIds) {
  return BillingAccountModel.query()
    .select('id', 'accountNumber')
    .findByIds([...uniqueBillingAccountIds])
}

function _makeObjects(models) {
  return models.map((model) => {
    return model.toJSON()
  })
}

module.exports = {
  go
}
