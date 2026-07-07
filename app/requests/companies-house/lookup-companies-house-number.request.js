/**
 * Sends a request to Companies House to return the matching company for the provided number
 * @module LookupCompaniesHouseNumberRequest
 */

import CompaniesHouseRequest from '../companies-house.request.js'

/**
 * Sends a request to Companies House to return the matching company for the provided number
 *
 * @param {string} companiesHouseNumber - The Companies House Number to lookup
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(companiesHouseNumber) {
  const path = `company/${companiesHouseNumber}`

  return CompaniesHouseRequest.get(path)
}

export {
  send
}
export default {
  send
}
