'use strict'

/**
 * Coordinates finding all matching search results for a search query from the /search page
 * @module FindAllSearchMatchesService
 */

const FetchLicenceSearchResultsService = require('./fetch-licence-search-results.service.js')
const FetchMonitoringStationSearchResultsService = require('./fetch-monitoring-station-search-results.service.js')
const FetchReturnLogSearchResultsService = require('./fetch-return-log-search-results.service.js')

const NO_RESULTS = { results: [], total: 0 }

/**
 * Coordinates finding all matching search results for a search query from the /search page
 *
 * Searches match any part of the field being searched, so the most relevant results won't necessarily be displayed
 * first. To avoid this happening, we first select the results that exactly match (case insensitive) the query.
 *
 * To prevent pointless searches, we also perform some checks on the search query to see if there are some things that
 * it is not worth searching for. For example, return references are always numeric, so we can skip searching for them
 * if the search query contains any letters.
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {number} page - The requested page
 *
 * @returns {Promise<string>} The full set of results
 */
async function go(query, page) {
  const allSearchResults = await _allSearchResults(query, page)

  return {
    exactSearchResults: _exactSearchResults(allSearchResults),
    largestResultCount: _largestResultCount(allSearchResults),
    similarSearchResults: _similarSearchResults(allSearchResults)
  }
}

async function _allSearchResults(query, page) {
  return Promise.all([
    _fullLicenceSearchResults(query, page),
    _fullMonitoringStationSearchResults(query, page),
    _fullReturnLogSearchResults(query, page),
    _partialLicenceSearchResults(query, page),
    _partialMonitoringStationSearchResults(query, page),
    _partialReturnLogSearchResults(query, page)
  ])
}

function _exactSearchResults(allSearchResults) {
  const [fullLicenceSearchResults, fullMonitoringStationSearchResults, fullReturnLogSearchResults] = allSearchResults

  return {
    amountFound:
      fullLicenceSearchResults.results.length +
      fullMonitoringStationSearchResults.results.length +
      fullReturnLogSearchResults.results.length,
    licences: fullLicenceSearchResults,
    monitoringStations: fullMonitoringStationSearchResults,
    returnLogs: fullReturnLogSearchResults
  }
}

async function _fullLicenceSearchResults(query, page) {
  if (!_matchesFullLicenceRef(query)) {
    return NO_RESULTS
  }

  return FetchLicenceSearchResultsService.go(query, page, true)
}

async function _fullMonitoringStationSearchResults(query, page) {
  return FetchMonitoringStationSearchResultsService.go(query, page, true)
}

async function _fullReturnLogSearchResults(query, page) {
  if (!_matchesFullReturnLogReference(query)) {
    return NO_RESULTS
  }

  return FetchReturnLogSearchResultsService.go(query, page, true)
}

function _largestResultCount(allSearchResults) {
  const [, , , partialLicenceSearchResults, partialMonitoringStationSearchResults, partialReturnLogSearchResults] =
    allSearchResults

  return Math.max(
    partialLicenceSearchResults.total,
    partialMonitoringStationSearchResults.total,
    partialReturnLogSearchResults.total
  )
}

function _matchesFullLicenceRef(query) {
  if (!_matchesPartialLicenceRef(query)) {
    return false
  }

  // Licence references are all at least 6 characters long
  if (query.length < 6) {
    return false
  }

  // If it contains a slash followed by at least two digits, it could be a full licence reference
  if (query.match(/.+\/\d{2}.+/)) {
    return true
  }

  // If it starts with at least 10 consecutive digits, it could be a full licence reference
  if (query.match(/^\d{10}/)) {
    return true
  }

  return false
}

function _matchesFullReturnLogReference(query) {
  // Return log references are just numeric, without leading zeros
  return query.match(/^[1-9]\d*$/)
}

function _matchesPartialLicenceRef(query) {
  // If there are three consecutive letters, it's not a licence reference
  if (query.match(/[a-z]{3}/i)) {
    return false
  }

  // If it contains a slash, it could be a licence reference
  if (query.includes('/')) {
    return true
  }

  // If it's only a single number then it could potentially be part of a licence reference, but it's not really
  // enough to go on so we won't search all the licences just for one matching digit
  if (query.match(/^\d$/)) {
    return false
  }

  // Otherwise, we have to assume that it could be a licence reference
  return true
}

function _matchesPartialReturnLogReference(query) {
  // Return log references contain only numerical digits
  return query.match(/^\d+$/)
}

async function _partialLicenceSearchResults(query, page) {
  if (!_matchesPartialLicenceRef(query)) {
    return NO_RESULTS
  }

  return FetchLicenceSearchResultsService.go(query, page, false)
}

async function _partialMonitoringStationSearchResults(query, page) {
  return FetchMonitoringStationSearchResultsService.go(query, page, false)
}

async function _partialReturnLogSearchResults(query, page) {
  if (!_matchesPartialReturnLogReference(query)) {
    return NO_RESULTS
  }

  return FetchReturnLogSearchResultsService.go(query, page, false)
}

function _similarSearchResults(allSearchResults) {
  const [, , , partialLicenceSearchResults, partialMonitoringStationSearchResults, partialReturnLogSearchResults] =
    allSearchResults

  return {
    amountFound:
      partialLicenceSearchResults.results.length +
      partialMonitoringStationSearchResults.results.length +
      partialReturnLogSearchResults.results.length,
    licences: partialLicenceSearchResults,
    monitoringStations: partialMonitoringStationSearchResults,
    returnLogs: partialReturnLogSearchResults
  }
}

module.exports = {
  go
}
