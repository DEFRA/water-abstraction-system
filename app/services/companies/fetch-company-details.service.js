'use strict'

/**
 * Fetches the company details for the view '/companies/{id}/{role}' page
 * @module FetchCompanyDetailsService
 */

const CompanyModel = require('../../models/company.model.js')
const CompanyAddressModel = require('../../models/company-address.model.js')

/**
 * Fetches the company details for the view '/companies/{id}/{role}' page
 *
 * @param {string} companyId - The UUID for the company to fetch
 * @param {string} role - the licence role e.g 'licenceHolder'
 *
 * @returns {Promise<module:CompanyModel>} the data needed to populate the view companies page
 */
async function go(companyId, role) {
  return _fetch(companyId, role)
}

async function _fetch(companyId, role) {
  return CompanyModel.query()
    .findById(companyId)
    .select(['id', 'name'])
    .withGraphFetched('companyAddresses')
    .modifyGraph('companyAddresses', (companyAddressesBuilder) => {
      companyAddressesBuilder
        .select(['id'])
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
        .limit(1)
        .first()
        .orderBy('startDate', 'desc')
        .whereExists(CompanyAddressModel.relatedQuery('licenceRole').where('name', role))
    })
}

module.exports = {
  go
}
