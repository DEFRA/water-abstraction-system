'use strict'

/**
 * Handles queries submitted to the /search page
 * @module SubmitSearchService
 */

const { formatValidationResult } = require('../../presenters/base.presenter.js')

const SearchLicenceService = require('./search-licences.service.js')
const SearchPresenter = require('../../presenters/search/search.presenter.js')
const SearchValidator = require('../../validators/search/search.validator.js')

/**
 * Handles queries submitted to the /search page
 *
 * This service uses other services to search the different types of entities and collates the results for display on
 * the /search page.
 *
 * @param {string} requestQuery - The query string from the request
 * @returns {Promise<object>} The view data for the search page
 */
async function go(requestQuery) {
  const validationResult = SearchValidator.go(requestQuery)
  const { query, page, error } = validationResult

  if (error) {
    const formattedData = SearchPresenter.go(query, page)

    return {
      activeNavBar: 'search',
      error: formatValidationResult(validationResult),
      ...formattedData
    }

  }

  const licences = SearchLicenceService.go(query, page)

  return pageData
}

module.exports = {
  go
}
