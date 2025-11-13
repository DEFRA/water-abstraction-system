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
 * @param {object} auth - The authentication object
 * @param {object} yar - The session object
 * @param {string} page - The requested page
 *
 * @returns {Promise<object>} The view data for the search page
 */
async function go(auth, yar, page) {
  const userScopes = auth.credentials.scope

  const searchQuery = yar.get('searchQuery')
  const searchResultType = yar.get('searchResultType')

  const resultType = searchResultType === 'all' ? null : searchResultType
  const pageNumber = Number(page)

  const allSearchMatches = await FindAllSearchMatchesService.go(searchQuery, resultType, pageNumber, userScopes)

  const pagination = PaginatorPresenter.go(allSearchMatches.largestResultCount, pageNumber, `/system/search`)

  const formattedData = SearchPresenter.go(
    userScopes,
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
