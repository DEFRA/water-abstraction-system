'use strict'

/**
 * Handles queries submitted to the /search page
 *
 * The search logic is currently very simple, just searching for licences by their number or name, based on the document
 * header table in the old CRM database.
 *
 * This replicates the way that the legacy system works, but is only the first step towards searching for different
 * entities, which the legacy system does, but also moving away from the old CRM entities and searching on licences
 * and their associated data.
 *
 * The search logic to date is:
 * - Query the licence document header table for any records where the licence number, licence name or metadata name
 * (which contains the current holder name) contains the search query (case insensitive)
 * - If there is only a single result and the search query exactly matches the licence number, redirect straight to that
 * licence
 * - If there are multiple results, display them in a paginated list
 * - Otherwise, if there are no results, display a 'no results' message
 *
 * @module SubmitSearchService
 */

const { ref } = require('objection')

const { formatValidationResult } = require('../../presenters/base.presenter.js')

const DatabaseConfig = require('../../../config/database.config.js')
const LicenceModel = require('../../models/licence.model.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
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

  if (error) {
    return _handleInvalidSearch(originalQuery, validationResult)
  }

  // We use the cleaned, validated values for searching
  const { query: queryForSearching, page } = value

  return _handleValidSearch(originalQuery, queryForSearching, page)
}

function _handleInvalidSearch(originalQuery, validationResult) {
  // If the search is invalid, we just re-display what the user entered, along with the validation error
  return {
    activeNavBar: 'search',
    error: formatValidationResult(validationResult),
    ...SearchPresenter.go(originalQuery)
  }
}

async function _handleValidSearch(originalQuery, queryForSearching, page) {
  // Check for matching licences - at the moment these are the only things we're searching for, but more things will
  // be added over time, in order to migrate the full search functionality from the legacy system
  const licenceSearchResult = await _searchLicences(queryForSearching, page)
  const licences = licenceSearchResult.results.length !== 0 ? licenceSearchResult.results : null

  // Where a user has entered criteria that exactly matches a single result, they may be redirected straight to that
  // record
  const redirect = _redirectForLicence(licenceSearchResult, queryForSearching)
  if (redirect) {
    return { redirect }
  }

  const pagination = PaginatorPresenter.go(licenceSearchResult.total, page, `/system/search`, { query: originalQuery })

  const formattedData = SearchPresenter.go(originalQuery, page, pagination.numberOfPages, licences)

  return {
    activeNavBar: 'search',
    ...formattedData,
    pagination
  }
}

function _redirectForLicence(licenceSearchResult, queryForSearching) {
  // If there's exactly one result, and it exactly matches the search query, redirect straight to that licence
  if (
    licenceSearchResult.total === 1 &&
    licenceSearchResult.results[0].licenceRef.toLowerCase() === queryForSearching.toLowerCase()
  ) {
    return `/system/licences/${licenceSearchResult.results[0].id}/summary`
  }

  return null
}

async function _searchLicences(query, page) {
  return LicenceModel.query()
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
}

module.exports = {
  go
}
