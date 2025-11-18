'use strict'

/**
 * Handles fetching search results for billing accounts on the /search page
 * @module FetchBillingAccountSearchResultsService
 */

const BillingAccountModel = require('../../models/billing-account.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Handles fetching search results for billing accounts on the /search page
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {number} page - The requested page
 * @param {boolean} matchFullReference - Whether to perform a full match or just a partial match (the default)
 *
 * @returns {Promise<object>} The search results and total number of matching rows in the database
 */
async function go(query, page, matchFullReference = false) {
  const fullReference = _fullReference(query)
  const partialReference = `%${fullReference}%`

  const select = BillingAccountModel.query()
    .select(['accountNumber', 'billingAccounts.id', 'billingAccounts.createdAt', 'name'])
    .joinRelated('company')
    .orderBy([{ column: 'accountNumber', order: 'asc' }])

  if (matchFullReference) {
    return select.where('accountNumber', 'ilike', fullReference).page(page - 1, 1000)
  }

  return select
    .whereNot('accountNumber', 'ilike', fullReference)
    .where('accountNumber', 'ilike', partialReference)
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

function _fullReference(query) {
  return query
    .replaceAll('\\', '\\\\')
    .replaceAll('%', String.raw`\%`)
    .replaceAll('_', String.raw`\_`)
}

module.exports = {
  go
}
