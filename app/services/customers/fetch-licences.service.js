'use strict'

/**
 * Fetches the customer licences data needed for the view 'customers/{id}/licences'
 * @module FetchLicencesService
 */

const DatabaseConfig = require('../../../config/database.config.js')
const LicenceDocumentRoleModel = require('../../models/licence-document-role.model.js')

/**
 * Fetches the customer licences data needed for the view 'customers/{id}/licences'
 *
 * @param {string} customerId - The customer id for the company
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the licences for the customer (this will be the licenceDocumentRoles) and the pagination object
 */
async function go(customerId, page) {
  const { results, total } = await _fetch(customerId, page)

  return { licences: results, pagination: { total } }
}

async function _fetch(customerId, page) {
  return LicenceDocumentRoleModel.query()
    .select(['id'])
    .where('companyId', customerId)
    .withGraphFetched('licenceDocument')
    .modifyGraph('licenceDocument', (licenceDocumentBuilder) => {
      licenceDocumentBuilder
        .select(['id', 'startDate', 'endDate'])
        .withGraphFetched('licence')
        .modifyGraph('licence', (licenceBuilder) => {
          licenceBuilder.select(['id', 'licenceRef']).modify('licenceName')
        })
    })
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
