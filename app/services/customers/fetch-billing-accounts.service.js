'use strict'

/**
 * Fetches the company billing accounts data needed for the view 'customers/{id}/billing-accounts'
 * @module FetchBillingAccountsService
 */

const BillingAccountModel = require('../../models/billing-account.model.js')
const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the company billing accounts data needed for the view 'customers/{id}/billing-accounts'
 *
 * @param {string} companyId - The company id for the company
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the billing accounts for the company and the pagination object
 */
async function go(companyId, page) {
  const { results, total } = await _fetch(companyId, page)

  return { billingAccounts: results, pagination: { total } }
}

async function _fetch(companyId, page) {
  return BillingAccountModel.query()
    .select('id', 'accountNumber')
    .where('companyId', companyId)
    .modify('contactDetails')
    .page(page - 1, DatabaseConfig.defaultPageSize)
}
module.exports = {
  go
}
