'use strict'

const SearchPresenter = require('../../presenters/search/search.presenter.js')

/**
 * Handles queries submitted to the /search page
 * @module QuerySearchService
 */

/**
 * Handles queries submitted to the /search page
 *
 * This service just displays a blank search page, actual search queries are handled by the `QuerySearchService`.
 *
 * @param {string} query - The search query
 * @param {number|string} page - The page number to display for pagination
 * @returns {Promise<object>} The view data for the search page
 */
async function go(query, page) {
  const formattedData = SearchPresenter.go(query, page)

  const pageData = {
    activeNavBar: 'search',
    ...formattedData
  }

  if (!query || query.trim() === '') {
    pageData.error = {
      errorList: [
        {
          href: '#$query',
          text: 'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
        }
      ],
      query: 'Enter a licence number, customer name, returns ID, registered email address or monitoring station'
    }
  }

  return pageData
}

module.exports = {
  go
}
