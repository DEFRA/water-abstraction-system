'use strict'

/**
 * Fetches the data from companys house for the provided companies house id
 * @module FetchCompanyService
 */

const LookupCompanysHouseIdRequest = require('../../../requests/companies-house/lookup-companys-house-id.request.js')

/**
 * Fetches the data from companys house for the provided companies house id
 *
 * @param {string} companiesHouseId - The companys house id to lookup
 *
 * @returns {Promise<object[]>} an object containing the matching companies needed to populate the view
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
