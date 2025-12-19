'use strict'

/**
 * Fetches the matching existing addresses for the commpany
 * @module FetchExistingAddressesService
 */

const CompanyAddressModel = require('../../../models/company-address.model.js')


/**
 * FFetches the matching existing addresses for the commpany
 *
 * @param {string} companyId - The UUID of the company to fetch addresses for
 *
 * @returns {Promise<object[]>} an object containing the matching addresses needed to populate the view
 */
async function go(companyId) {
  return CompanyAddressModel.query()
    .withGraphFetched('address')
    .modifyGraph('address', (addressBuilder) => {
      addressBuilder.select(['id', 'address1', 'address2', 'address3', 'address4', 'address5', 'address6', 'postcode'])
    })
    .distinctOn('addressId')
    .where('companyId', companyId)
}

module.exports = {
  go
}
