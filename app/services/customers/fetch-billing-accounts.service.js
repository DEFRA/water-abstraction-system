'use strict'

/**
 * Fetches the customer billing accounts data needed for the view 'customers/{id}/billing-accounts'
 * @module FetchBillingAccountsService
 */

const BillingAccountModel = require('../../models/billing-account.model.js')
const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the customer billing accounts data needed for the view 'customers/{id}/billing-accounts'
 *
 * @param {string} customerId - The customer id for the company
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the billing accounts for the customer and the pagination object
 */
async function go(customerId, page) {
  const { results, total } = await _fetch(customerId, page)

  return { billingAccounts: results, pagination: { total } }
}

async function _fetch(customerId, page) {
  return BillingAccountModel.query()
    .select('id', 'accountNumber')
    .where('companyId', customerId)
    .modify('contactDetails')
    .page(page - 1, DatabaseConfig.defaultPageSize)
}
module.exports = {
  go
}
