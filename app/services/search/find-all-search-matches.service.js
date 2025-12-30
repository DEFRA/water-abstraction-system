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
 * FetchSearchResultsService is used to get a page of matching result IDs and their types, then
 * FetchSearchResultsDetailsService is used to get the full details for each result
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

/**
 * Group search result IDs by their type
 *
 * `FetchSearchResultsService` returns a page of results in the order they should be displayed. This function collates
 * the result IDs by their type so that the set of IDs can be used as a single call for each type.
 *
 * For example, if `searchResults` contains:
 *
 * ```
 * [
 *   { exact: true, id: 'licence-1', type: 'licence' },
 *   { exact: true, id: 'holder-1', type: 'holder' },
 *   { exact: false, id: 'licence-2', type: 'licence' }
 * ]
 * ```
 *
 * This function will return:
 *
 * ```
 * {
 *   licence: ['licence-1', 'licence-2'],
 *   holder: ['holder-1']
 * }
 * ```
 *
 * @private
 */
function _idsByType(searchResults) {
  return searchResults.reduce((groupedIds, searchResult) => {
    if (!groupedIds[searchResult.type]) {
      groupedIds[searchResult.type] = []
    }
    groupedIds[searchResult.type].push(searchResult.id)
    return groupedIds
  }, {})
}

/**
 * Maps ordered search results to their full models
 *
 * `FetchSearchResultsService` returns a page of results in the order they should be displayed, but
 * `FetchSearchResultsDetailsService` returns the full models grouped by type, not in order.
 *
 * This function maps the ordered search results to their full models so that the final results are in the correct order
 * for display.
 *
 * For example, if `orderedSearchResults` contains:
 *
 * ```
 * [
 *   { exact: true, id: 'licence-1', type: 'licence' },
 *   { exact: true, id: 'holder-1', type: 'holder' },
 *   { exact: false, id: 'licence-2', type: 'licence' }
 * ]
 * ```
 *
 * And the `modelsByType` contains:
 *
 * ```
 * {
 *  licence: [ { id: 'licence-1', ... }, { id: 'licence-2', ... } ],
 *  holder: [ { id: 'holder-1', ... } ]
 * }
 * ```
 *
 * This function will return:
 *
 * ```
 * [
 *   { exact: true, model: { id: 'licence-1', ... }, type: 'licence' },
 *   { exact: true, model: { id: 'holder-1', ... }, type: 'holder' },
 *   { exact: false, model: { id: 'licence-2', ... }, type: 'licence' }
 * ]
 * ```
 *
 * @private
 */
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
