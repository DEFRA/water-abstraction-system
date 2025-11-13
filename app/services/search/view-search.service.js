'use strict'

const SearchPresenter = require('../../presenters/search/search.presenter.js')

/**
 * Handles initial display of the /search page
 * @module ViewSearchService
 */

/**
 * Handles initial display of the /search page
 *
 * This service just displays a blank search page.
 *
 * @param {object} auth - The authentication object
 *
 * @returns {Promise<object>} The view data for the search page
 */
async function go(auth) {
  const userScopes = auth.credentials.scope

  const formattedData = SearchPresenter.go(userScopes)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

module.exports = {
  go
}
