'use strict'

/**
 * Fetches the customer data needed for the view 'customers/{id}/contacts'
 * @module FetchCustomerService
 */

const CompanyModel = require('../../models/company.model.js')

/**
 * Fetches the customer data needed for the view 'customers/{id}/contacts'
 *
 * @param {string} customerId - The customer id for the company
 *
 * @returns {Promise<module:CompanyModel>} the data needed to populate the view customer page's
 */
async function go(customerId) {
  return _fetch(customerId)
}

async function _fetch(customerId) {
  return CompanyModel.query().findById(customerId).select(['id', 'name'])
}

module.exports = {
  go
}
