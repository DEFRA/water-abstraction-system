'use strict'

/**
 * Handles queries submitted to the /search page
 * @module SubmitSearchService
 */

const SearchPresenter = require('../../presenters/search/search.presenter.js')
const SearchValidator = require('../../validators/search/search.validator.js')
const { formatValidationResult } = require('../../presenters/base.presenter.js')

/**
 * Handles queries submitted to the /search page
 *
 * An invalid search value will result in the search page being re-displayed with an error message.
 *
 * Otherwise, the search value will be stored in the session and the user redirected to the appropriate page.
 *
 * @param {object} auth - The authentication object
 * @param {object} payload - The request payload containing the search query
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller, where we will store the
 * search query
 *
 * @returns {Promise<object>} The view data for the search page if there are validation errors or a redirect to the next
 * page to display, which could be the search results or the display page for a specific record
 */
async function go(auth, payload, yar) {
  const validationResult = SearchValidator.go(payload)

  if (validationResult.error) {
    const { query, resultType } = payload
    const userScopes = auth.credentials.scope

    return {
      activeNavBar: 'search',
      error: formatValidationResult(validationResult),
      ...SearchPresenter.go(userScopes, query, resultType)
    }
  }

  // If no search query was provided, it can only have been a valid request if they clicked on a filter button, but with
  // no search query there's nothing to filter, so just redirect back to the main search page
  if (!validationResult.value.query) {
    return { redirect: '/system/search' }
  }

  yar.set('searchQuery', validationResult.value.query)
  if (validationResult.value.filter === 'clear') {
    yar.set('searchResultType', 'all')
  } else {
    yar.set('searchResultType', validationResult.value.resultType)
  }

  return { redirect: '/system/search?page=1' }
}

module.exports = {
  go
}
