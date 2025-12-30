'use strict'

/**
 * Handles fetching and displaying data for display on the /search page
 * @module ViewSearchService
 */

const FindAllSearchMatchesService = require('./find-all-search-matches.service.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const SearchPresenter = require('../../presenters/search/search.presenter.js')

/**
 * Handles fetching and displaying data for display on the /search page
 *
 * @param {object} auth - The authentication object
 * @param {object} yar - The session object
 * @param {string} page - The requested page
 *
 * @returns {Promise<object>} The view data for the search page
 */
async function go(auth, yar, page) {
  const userScopes = auth.credentials.scope

  // Requests sent to the /search page might be either to just show the search page or to view search results, so we
  // need to check whether this is just an initial request to display the page (i.e. no page parameter is present) or
  // whether it is a request for a page of results
  if (!page) {
    return _blankPage(userScopes)
  }

  // Otherwise, this is a request for a page of results
  const searchQuery = yar.get('searchQuery')
  const searchResultType = yar.get('searchResultType')
  const resultType = searchResultType === 'all' ? null : searchResultType
  const pageNumber = Number(page)

  return _pageOfResults(userScopes, searchQuery, resultType, pageNumber)
}

async function _blankPage(userScopes) {
  const formattedData = SearchPresenter.go(userScopes)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

async function _pageOfResults(userScopes, searchQuery, resultType, pageNumber) {
  const allSearchMatches = await FindAllSearchMatchesService.go(searchQuery, resultType, pageNumber, userScopes)

  const { results, total } = allSearchMatches

  const pagination = PaginatorPresenter.go(total, pageNumber, `/system/search`, results.length, 'matches')

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
