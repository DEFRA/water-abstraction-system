/**
 * Fetches any companies that meet the search criteria from Companies House
 * @module FetchCompaniesService
 */

import { send } from '../../../requests/companies-house/search-companies.request.js'

/**
 * Fetches any companies that meet the search criteria from Companies House
 *
 * @param {string} companySearch - The string to search for
 *
 * @returns {Promise<object[]>} an object containing the matching companies needed to populate the view
 */
export default async function fetchCompanies(companySearch) {
  const result = await send(companySearch)

  if (!result.succeeded) {
    return []
  }

  const companies = result.matches.map((company) => {
    return {
      address: company.address_snippet,
      number: company.company_number,
      title: company.title
    }
  })

  return companies
}
