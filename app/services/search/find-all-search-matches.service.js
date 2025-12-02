'use strict'

/**
 * Coordinates finding all matching search results for a search query from the /search page
 * @module FindAllSearchMatchesService
 */

const DetermineSearchItemsService = require('./determine-search-items.service.js')
const FetchSearchResultsDetailsService = require('./fetch-search-results-details.service.js')
const FetchSearchResultsService = require('./fetch-search-results.service.js')

/**
 * Coordinates finding all matching search results for a search query from the /search page
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {string} resultType - The type of search result to display
 * @param {number} page - The requested page
 * @param {string[]} userScopes - The user's scopes
 *
 * @returns {Promise<object>} The full set of results for the requested page
 */
async function go(query, resultType, page, userScopes) {
  const resultTypes = DetermineSearchItemsService.go(query, resultType, userScopes)

  const { results: orderedSearchResults, total } = await FetchSearchResultsService.go(query, resultTypes, page)

  const idsByType = _idsByType(orderedSearchResults)

  const modelsByType = await FetchSearchResultsDetailsService.go(idsByType)

  const results = _results(orderedSearchResults, modelsByType)

  return { results, total }
}

function _idsByType(searchResults) {
  return searchResults.reduce((groupedIds, searchResult) => {
    if (!groupedIds[searchResult.type]) {
      groupedIds[searchResult.type] = []
    }
    groupedIds[searchResult.type].push(searchResult.id)
    return groupedIds
  }, {})
}

function _results(orderedSearchResults, modelsByType) {
  return orderedSearchResults.map(({ exact, id, type }) => {
    const model = modelsByType[type].find((modelFound) => {
      return modelFound.id === id
    })

    return { exact, model, type }
  })
}

module.exports = {
  go
}
