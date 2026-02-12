'use strict'

/**
 * Fetches any companies that meet the search criteria from Companies House
 * @module FetchCompaniesService
 */

const { HTTP_STATUS_OK } = require('node:http2').constants

const CompaniesRequest = require('../../../requests/companies-house/companies.request.js')

/**
 * Fetches any companies that meet the search criteria from Companies House
 *
 * @param {string} companySearch - The string to search for
 *
 * @returns {Promise<object[]>} an object containing the matching companies needed to populate the view
 */
async function go(companySearch) {
  const result = await CompaniesRequest.send(companySearch)

  if (result.response.statusCode !== HTTP_STATUS_OK) {
    return []
  }

  const companies = result.matches.map((company) => {
    return {
      companiesHouseId: company.company_number,
      address: `${company.title}, ${company.address_snippet}`
    }
  })

  return companies
}

module.exports = {
  go
}
