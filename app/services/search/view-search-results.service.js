'use strict'

/**
 * Handles fetching and displaying search results on the /search page
 *
 * The search logic to date is:
 * - When a search is submitted, FindSingleSearchMatchService is called to see if there is a single exact match for the
 * query, currently just a licence number. If there is, the user is redirected straight to that record.
 * - Otherwise, the user is taken to the search results page, which calls this service. This then:
 * - Checks to see if the search text looks like a return reference and if it does, searches for return logs.
 * - Queries the licence document header table for any records where the licence number, licence name or metadata name
 * (which contains the current holder name) contains the search query (case insensitive). This replicates the way that
 * the legacy system works, but is a first step towards moving away from the old CRM entities and searching on licences
 * and their associated data instead.
 * - Displays the results in a paginated list, based on the longest of the two sets of results.
 * - Otherwise, if there are no results, displays a 'no results' message
 *
 * @module ViewSearchResultsService
 */

const { ref } = require('objection')

const DatabaseConfig = require('../../../config/database.config.js')
const LicenceModel = require('../../models/licence.model.js')
const PaginatorPresenter = require('../../presenters/paginator.presenter.js')
const ReturnLogModel = require('../../models/return-log.model.js')
const SearchPresenter = require('../../presenters/search/search.presenter.js')

const RETURN_REFERENCE_PATTERN = /^[1-9]\d*$/

/**
 * Handles fetching and displaying search results on the /search page
 *
 * @param {string} searchQuery - The value to search for, taken from the session
 * @param {string} page - The requested page
 *
 * @returns {Promise<object>} The view data for the search page
 */
async function go(searchQuery, page) {
  const pageNumber = Number(page)

  const licenceSearchResult = await _searchLicences(searchQuery, pageNumber)
  const licences = licenceSearchResult.results.length !== 0 ? licenceSearchResult.results : null

  const returnLogSearchResult = await _searchReturnLogs(searchQuery, pageNumber)
  const returnLogs = returnLogSearchResult.results.length !== 0 ? returnLogSearchResult.results : null

  const totalResults = Math.max(licenceSearchResult.total, returnLogSearchResult.total)

  const pagination = PaginatorPresenter.go(totalResults, pageNumber, `/system/search`)

  const formattedData = SearchPresenter.go(searchQuery, pageNumber, pagination.numberOfPages, licences, returnLogs)

  return {
    activeNavBar: 'search',
    ...formattedData,
    pagination
  }
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
      'revokedDate',
      'lapsedDate',
      'expiredDate',
      'doc.metadata',
      'doc.licenceName'
    ])
    .orderBy([{ column: 'licences.licenceRef', order: 'asc' }])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

async function _searchReturnLogs(query, page) {
  if (!RETURN_REFERENCE_PATTERN.test(query)) {
    return { results: [], total: 0 }
  }

  return ReturnLogModel.query()
    .select(['return_logs.*', 'regions.nald_region_id as region_id', 'regions.display_name as region'])
    .join('regions', ref('return_logs.metadata:nald.regionCode').castInt(), 'regions.nald_region_id')
    .where('returnReference', '=', query)
    .orderBy([{ column: 'endDate', order: 'asc' }])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
