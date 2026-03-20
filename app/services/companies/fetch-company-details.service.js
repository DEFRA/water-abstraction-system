'use strict'

/**
 * Fetches the company details for the view '/companies/{id}/{role}' page
 * @module FetchCompanyDetailsService
 */

const CompanyModel = require('../../models/company.model.js')

/**
 * Fetches the company details for the view '/companies/{id}/{role}' page
 *
 * @param {string} companyId - The UUID for the company to fetch
 * @param {string} role - the licence role e.g 'licenceHolder'
 *
 * @returns {Promise<module:CompanyModel>} the data needed to populate the view company page
 */
async function go(companyId, role) {
  return CompanyModel.query()
    .findById(companyId)
    .select(['id', 'name'])
    .withGraphFetched('companyAddresses')
    .modifyGraph('companyAddresses', (companyAddressesBuilder) => {
      companyAddressesBuilder
        .select(['companyAddresses.endDate', 'companyAddresses.id', 'companyAddresses.startDate'])
        .innerJoinRelated('licenceRole')
        .where('licenceRole.name', role)
        .orderBy([
          { column: 'endDate', order: 'desc', nulls: 'first' },
          { column: 'startDate', order: 'desc' }
        ])
        .withGraphFetched('address')
        .modifyGraph('address', (addressBuilder) => {
          addressBuilder.select([
            'id',
            'address1',
            'address2',
            'address3',
            'address4',
            'address5',
            'address6',
            'country',
            'postcode'
          ])
        })
    })
}

module.exports = {
  go
}
