'use strict'

/**
 * Handles queries submitted to the /search page
 * @module SubmitSearchService
 */

const { ref } = require('objection')

const { formatValidationResult } = require('../../presenters/base.presenter.js')

const DatabaseConfig = require('../../../config/database.config.js')
const LicenceModel = require('../../models/licence.model.js')
const SearchPresenter = require('../../presenters/search/search.presenter.js')
const SearchValidator = require('../../validators/search/search.validator.js')

/**
 * Handles queries submitted to the /search page
 *
 * This service uses other services to search the different types of entities and collates the results for display on
 * the /search page.
 *
 * @param {object} requestQuery - The query object from the request
 * @returns {Promise<object>} The view data for the search page
 */
async function go(requestQuery) {
  const { query: originalQuery } = requestQuery

  const validationResult = SearchValidator.go(requestQuery)
  const { error, value } = validationResult

  // If the search is invalid, we just re-display what the user entered, along with the validation error
  if (error) {
    return {
      activeNavBar: 'search',
      error: formatValidationResult(validationResult),
      ...SearchPresenter.go(originalQuery)
    }
  }

  // We use the cleaned, validated values for searching
  const { query: queryForSearching, page } = value

  const licenceSearchResult = await _searchLicences(queryForSearching, page)
  const licences = licenceSearchResult.results.length !== 0 ? licenceSearchResult.results : null
  const formattedData = SearchPresenter.go(originalQuery, page, licences)

  return {
    activeNavBar: 'search',
    ...formattedData
  }
}

async function _searchLicences(query, page) {
  const searchResults = await LicenceModel.query()
    .joinRelated('licenceDocumentHeader', { alias: 'doc' })
    .where('doc.licenceRef', 'ilike', `%${query}%`)
    .orWhere('doc.licenceName', 'ilike', `%${query}%`)
    .orWhere(ref('doc.metadata:Name').castText(), 'ilike', `%${query}%`)
    .select([
      'licences.id',
      'licences.licenceRef',
      'startDate',
      'revokedDate',
      'lapsedDate',
      'expiredDate',
      'doc.metadata',
      'doc.licenceName'
    ])
    .orderBy([{ column: 'licences.licenceRef', order: 'asc' }])
    .page(page - 1, DatabaseConfig.defaultPageSize)

  // TODO: Any processing needed on these records before returning?
  console.log(searchResults)

  return searchResults
}

module.exports = {
  go
}
