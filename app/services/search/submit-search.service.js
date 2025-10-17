'use strict'

/**
 * Handles queries submitted to the /search page
 *
 * @module SubmitSearchService
 */

const { formatValidationResult } = require('../../presenters/base.presenter.js')
const FindSingleSearchMatchService = require('./find-single-search-match.service.js')
const SearchPresenter = require('../../presenters/search/search.presenter.js')
const SearchValidator = require('../../validators/search/search.validator.js')

/**
 * Handles queries submitted to the /search page
 *
 * An invalid search value will result in the search page being re-displayed with an error message.
 *
 * Otherwise, the search value will be stored in the session and the user redirected to the appropriate page.
 *
 * @param {object} payload - The request payload containing the search query
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller, where we will store the
 * search query
 *
 * @returns {Promise<object>} The view data for the search page if there are validation errors or a redirect to the next
 * page to display, which could be the search results or the display page for a specific record
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

  let redirect = await FindSingleSearchMatchService.go(validationResult.value.query)
  if (!redirect) {
    redirect = '/system/search?page=1'
  }

  return { redirect }
}

module.exports = {
  go
}
