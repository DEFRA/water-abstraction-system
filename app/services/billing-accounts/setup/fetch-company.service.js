'use strict'

/**
 * Fetches the data from Companies House for the provided Companies House ID
 * @module FetchCompanyService
 */

const LookupCompanysHouseIdRequest = require('../../../requests/companies-house/lookup-companies-house-id.request.js')

/**
 * Fetches the data from Companies House for the provided Companies House ID
 *
 * @param {string} companiesHouseId - The Companies House id to lookup
 *
 * @returns {Promise<object>} an object containing the matching company's ID number and name
 */
async function go(companiesHouseId) {
  if (!companiesHouseId) {
    return null
  }

  const result = await LookupCompanysHouseIdRequest.send(companiesHouseId)

  if (!result.succeeded) {
    return null
  }

  const { body } = result.response

  return {
    companiesHouseId: body.company_number,
    title: body.company_name
  }
}

module.exports = {
  go
}
