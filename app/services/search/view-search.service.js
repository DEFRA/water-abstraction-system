'use strict'

const SearchPresenter = require('../../presenters/search/search.presenter.js')

/**
 * Handles initial display of the /search page
 * @module ViewSearchService
 */

/**
 * Handles initial display of the /search page
 *
 * This service just displays a blank search page, actual search queries are handled by the `SubmitSearchService`.
 *
 * @returns {Promise<object>} The view data for the search page
 */
async function go() {
  const formattedData = SearchPresenter.go()

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
