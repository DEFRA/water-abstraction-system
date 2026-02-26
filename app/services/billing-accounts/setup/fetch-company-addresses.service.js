'use strict'

/**
 * Fetches the company and it's matching addresses if any
 * @module FetchCompanyAddressesService
 */

const AddressModel = require('../../../models/address.model.js')
const CompanyModel = require('../../../models/company.model.js')

/**
 * Fetches the company and it's matching addresses if any
 *
 * @param {string} companyId - The UUID of the company to fetch addresses for
 *
 * @returns {Promise<object[]>} an object containing the matching addresses needed to populate the view
 */
async function go(companyId) {
  const company = await CompanyModel.query().select(['id', 'name']).findById(companyId)
  const addresses = await AddressModel.query()
    .select(['addresses.id', 'address1', 'address2', 'address3', 'address4', 'address5', 'address6', 'postcode'])
    .innerJoinRelated('companyAddresses')
    .where('companyAddresses.companyId', companyId)
    .distinct('addresses.id')

  return {
    company,
    addresses
  }
}

module.exports = {
  go
}
