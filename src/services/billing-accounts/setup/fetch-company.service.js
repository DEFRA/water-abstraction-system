/**
 * Fetches the data from Companies House for the provided Companies House Number
 * @module FetchCompanyService
 */

import LookupCompaniesHouseNumberRequest from '../../../requests/companies-house/lookup-companies-house-number.request.js'

/**
 * Fetches the data from Companies House for the provided Companies House Number
 *
 * @param {string} companiesHouseNumber - The Companies House Number to lookup
 *
 * @returns {Promise<object>} an object containing the matching companies house number and name
 */
export default async function fetchCompanyService(companiesHouseNumber) {
  if (!companiesHouseNumber) {
    return null
  }

  const result = await LookupCompaniesHouseNumberRequest(companiesHouseNumber)

  if (!result.succeeded) {
    return null
  }

  const { body } = result.response

  return {
    companiesHouseNumber: body.company_number,
    title: body.company_name
  }
}
