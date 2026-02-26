'use strict'

/**
 * Fetches the company and it's matching addresses if any
 * @module FetchCompanyAddressesService
 */

const CompanyAddressModel = require('../../../models/company-address.model.js')
const CompanyModel = require('../../../models/company.model.js')

/**
 * Fetches the company and it's matching addresses if any
 *
 * @param {string} companyId - The UUID of the company to fetch addresses for
 *
 * @returns {Promise<object[]>} an object containing the matching addresses needed to populate the view
 */
async function go(companyId) {
  const company = await CompanyModel.query().select(['id', 'name']).where('id', companyId)
  const companyAddresses = await CompanyAddressModel.query()
    .select(['id', 'addressId', 'companyId'])
    .withGraphFetched('address')
    .modifyGraph('address', (addressBuilder) => {
      addressBuilder.select(['id', 'address1', 'address2', 'address3', 'address4', 'address5', 'address6', 'postcode'])
    })
    .distinctOn('addressId')
    .where('companyId', companyId)

  const addresses = companyAddresses.map((companyAddress) => {
    return companyAddress.address
  })

  return {
    company: company[0],
    addresses
  }
}

module.exports = {
  go
}
