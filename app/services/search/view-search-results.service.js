'use strict'

/**
 * Handles fetching and displaying search results on the /search page
 * @module ViewSearchResultsService
 */

const FindAllSearchMatchesService = require('./find-all-search-matches.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const SearchPresenter = require('../../presenters/search/search.presenter.js')

/**
 * Handles fetching and displaying search results on the /search page
 *
 * @param {string} searchQuery - The value to search for, taken from the session
 * @param {string} searchResultType - The type of search result to display
 * @param {string} page - The requested page
 *
 * @returns {Promise<object>} The view data for the search page
 */
async function go(searchQuery, searchResultType, page) {
  const resultType = searchResultType === 'all' ? null : searchResultType
  const pageNumber = Number(page)

  const allSearchMatches = await FindAllSearchMatchesService.go(searchQuery, resultType, pageNumber)

  const pagination = PaginatorPresenter.go(allSearchMatches.largestResultCount, pageNumber, `/system/search`)

  const formattedData = SearchPresenter.go(
    searchQuery,
    resultType,
    pageNumber,
    pagination.numberOfPages,
    allSearchMatches
  )

  return {
    activeNavBar: 'search',
    ...formattedData,
    pagination
  }
}

module.exports = {
  go
}
