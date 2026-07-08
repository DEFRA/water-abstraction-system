/**
 * Sends a request to Companies House to search for matching companies for the provided string
 * @module SearchCompaniesRequest
 */

import { getRequest } from '../companies-house.request.js'

/**
 * Sends a request to Companies House to search for matching companies for the provided string
 *
 * @param {string} queryString - The postcode to look up addresses for
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
export async function send(queryString) {
  const path = `search/companies`
  const searchParams = {
    q: queryString,
    start_index: 0,
    items_per_page: 15
  }

  return getRequest(path, searchParams)
}
