'use strict'

/**
 * Fetches the customer licences data needed for the view 'customers/{id}/licences'
 * @module FetchLicencesService
 */

const CompanyModel = require('../../models/company.model.js')

/**
 * Fetches the customer licences data needed for the view 'customers/{id}/licences'
 *
 * @param {string} customerId - The customer id for the company
 *
 * @returns {object} the licences for the customer (this will be the licenceDocumentRoles)
 */
async function go(customerId) {
  const company = await _fetch(customerId)

  return company.licenceDocumentRoles
}

async function _fetch(customerId) {
  return CompanyModel.query()
    .findById(customerId)
    .select(['id'])
    .withGraphFetched('licenceDocumentRoles')
    .modifyGraph('licenceDocumentRoles', (licenceDocumentRolesBuilder) => {
      licenceDocumentRolesBuilder
        .select(['id'])
        .withGraphFetched('licenceDocument')
        .modifyGraph('licenceDocument', (licenceDocumentBuilder) => {
          licenceDocumentBuilder
            .select(['id', 'startDate', 'endDate'])
            .withGraphFetched('licence')
            .modifyGraph('licence', (licenceBuilder) => {
              licenceBuilder.select(['id', 'licenceRef']).modify('licenceName')
            })
        })
    })
}

module.exports = {
  go
}
