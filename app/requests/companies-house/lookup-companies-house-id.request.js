'use strict'

/**
 * Sends a request to Companies House to return the matching company for the provided id
 * @module LookupCompanysHouseIdRequest
 */

const CompaniesHouseRequest = require('../companies-house.request.js')

/**
 * Sends a request to Companies House to return the matching company for the provided id
 *
 * @param {string} companiesHouseId - The Companies House id to lookup
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(companiesHouseId) {
  const path = `company/${companiesHouseId}`

  return CompaniesHouseRequest.get(path)
}

module.exports = {
  send
}
