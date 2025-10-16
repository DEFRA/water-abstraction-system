'use strict'

/**
 * Handles queries submitted to the /search page
 *
 * @module SubmitSearchService
 */

const { formatValidationResult } = require('../../presenters/base.presenter.js')
const SearchPresenter = require('../../presenters/search/search.presenter.js')
const SearchValidator = require('../../validators/search/search.validator.js')

/**
 * Handles queries submitted to the /search page
 *
 * An invalid search value will result in the search page being re-displayed with an error message.
 *
 * Otherwise, the search value will be stored in the session and the user redirected to the results page.
 *
 * @param {object} payload - The request payload containing the search query
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller, where we will store the
 * search query
 *
 * @returns {Promise<object>} The view data for the search page if there are validation errors, otherwise an empty object as
 * the request will be redirected to the results page
 */
async function go(payload, yar) {
  const validationResult = SearchValidator.go(payload)

  if (validationResult.error) {
    return {
      activeNavBar: 'search',
      error: formatValidationResult(validationResult),
      ...SearchPresenter.go(payload.query)
    }
  }

  yar.set('searchQuery', validationResult.value.query)

  return {}
}

module.exports = {
  go
}
