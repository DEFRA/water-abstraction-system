'use strict'

/**
 * Formats data for the `/search` page
 * @module SearchPresenter
 */

/**
 * Formats data for the `/search` page
 *
 * (There will be more parameters along once we actually have some data to display)
 *
 * @param {string} query - The user-entered search query
 * @param {string} page - The user-requested page, for paginated results
 *
 * @returns {object} - The data formatted for the view template
 */
function go(query, page) {
  // We're not actually doing any querying yet, just returning the query text for re-display
  return {
    pageTitle: 'Search',
    query: query || ''
  }
}

module.exports = {
  go
}
