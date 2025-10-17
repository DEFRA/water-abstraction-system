'use strict'

/**
 * Handles fetching and displaying search results on the /search page
 * @module ViewSearchResultsService
 */

const FetchLicenceSearchResultsService = require('./fetch-licence-search-results.service.js')
const FetchReturnLogSearchResultsService = require('./fetch-return-log-search-results.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const SearchPresenter = require('../../presenters/search/search.presenter.js')

/**
 * Handles fetching and displaying search results on the /search page
 *
 * The search logic to date is:
 * - When a search is submitted, FindSingleSearchMatchService is called to see if there is a single exact match for the
 * query, currently just a licence number. If there is, the user is redirected straight to that record.
 * - Otherwise, the user is taken to the search results page, which calls this service. This then:
 * - Checks to see if the search text looks like part of a return reference and if it does, searches for return logs.
 * - Queries the licence table for any records where the licence number contains the search query.
 * - Displays the results in a paginated list, based on the longest of the two sets of results.
 * - Otherwise, if there are no results, displays a 'no results' message
 *
 * @param {string} searchQuery - The value to search for, taken from the session
 * @param {string} page - The requested page
 *
 * @returns {Promise<object>} The view data for the search page
 */
async function go(searchQuery, page) {
  const pageNumber = Number(page)

  const licenceSearchResult = await FetchLicenceSearchResultsService.go(searchQuery, pageNumber)
  const licences = licenceSearchResult.results.length !== 0 ? licenceSearchResult.results : null

  const returnLogSearchResult = await FetchReturnLogSearchResultsService.go(searchQuery, pageNumber)
  const returnLogs = returnLogSearchResult.results.length !== 0 ? returnLogSearchResult.results : null

  const mostResults = Math.max(licenceSearchResult.total, returnLogSearchResult.total)

  const pagination = PaginatorPresenter.go(mostResults, pageNumber, `/system/search`)

  const formattedData = SearchPresenter.go(searchQuery, pageNumber, pagination.numberOfPages, licences, returnLogs)

  return {
    activeNavBar: 'search',
    ...formattedData,
    pagination
  }
}

module.exports = {
  go
}
