'use strict'

/**
 * Coordinates finding all matching search results for a search query from the /search page
 * @module FindAllSearchMatchesService
 */

const FetchLicenceSearchResultsService = require('./fetch-licence-search-results.service.js')
const FetchMonitoringStationSearchResultsService = require('./fetch-monitoring-station-search-results.service.js')
const FetchReturnLogSearchResultsService = require('./fetch-return-log-search-results.service.js')
const FetchUserSearchResultsService = require('./fetch-user-search-results.service.js')

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
 * @param {string} resultType - The type of search result to display
 * @param {number} page - The requested page
 *
 * @returns {Promise<string>} The full set of results
 */
async function go(query, resultType, page) {
  const allSearchResults = await _allSearchResults(query, resultType, page)
  const fullMatches = allSearchResults.slice(0, 4)
  const partialMatches = allSearchResults.slice(4)

  return {
    exactSearchResults: _searchResults(fullMatches),
    largestResultCount: _largestResultCount(partialMatches),
    similarSearchResults: _searchResults(partialMatches)
  }
}

async function _allSearchResults(query, resultType, page) {
  return Promise.all([
    _fullLicenceSearchResults(query, resultType, page),
    _fullMonitoringStationSearchResults(query, resultType, page),
    _fullReturnLogSearchResults(query, resultType, page),
    _fullUserSearchResults(query, resultType, page),
    _partialLicenceSearchResults(query, resultType, page),
    _partialMonitoringStationSearchResults(query, resultType, page),
    _partialReturnLogSearchResults(query, resultType, page),
    _partialUserSearchResults(query, resultType, page)
  ])
}

async function _fullLicenceSearchResults(query, resultType, page) {
  if (resultType && resultType !== 'licence') {
    return NO_RESULTS
  }

  if (!_matchesFullLicenceRef(query)) {
    return NO_RESULTS
  }

  return FetchLicenceSearchResultsService.go(query, page, true)
}

async function _fullMonitoringStationSearchResults(query, resultType, page) {
  if (resultType && resultType !== 'monitoringStation') {
    return NO_RESULTS
  }

  return FetchMonitoringStationSearchResultsService.go(query, page, true)
}

async function _fullReturnLogSearchResults(query, resultType, page) {
  if (resultType && resultType !== 'returnLog') {
    return NO_RESULTS
  }

  if (!_matchesFullReturnLogReference(query)) {
    return NO_RESULTS
  }

  return FetchReturnLogSearchResultsService.go(query, page, true)
}

async function _fullUserSearchResults(query, resultType, page) {
  if (resultType && resultType !== 'user') {
    return NO_RESULTS
  }

  if (!_matchesFullUsername(query)) {
    return NO_RESULTS
  }

  return FetchUserSearchResultsService.go(query, page, true)
}

function _largestResultCount(searchResults) {
  const [licences, monitoringStations, returnLogs, users] = searchResults

  return Math.max(licences.total, monitoringStations.total, returnLogs.total, users.total)
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
  if (query.match(/^.+\/\d{2}.+$/)) {
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

function _matchesFullUsername(query) {
  // Usernames will have at least one character before the @ sign and we expect at least five characters after
  return query.match(/^.+@.{5,}$/)
}

function _matchesPartialLicenceRef(query) {
  // If there are three consecutive letters, it's not a licence reference
  return !query.match(/[a-z]{3}/i)
}

function _matchesPartialReturnLogReference(query) {
  // Return log references contain only numerical digits
  return query.match(/^\d+$/)
}

async function _partialLicenceSearchResults(query, resultType, page) {
  if (resultType && resultType !== 'licence') {
    return NO_RESULTS
  }

  if (!_matchesPartialLicenceRef(query)) {
    return NO_RESULTS
  }

  return FetchLicenceSearchResultsService.go(query, page, false)
}

async function _partialMonitoringStationSearchResults(query, resultType, page) {
  if (resultType && resultType !== 'monitoringStation') {
    return NO_RESULTS
  }

  return FetchMonitoringStationSearchResultsService.go(query, page, false)
}

async function _partialReturnLogSearchResults(query, resultType, page) {
  if (resultType && resultType !== 'returnLog') {
    return NO_RESULTS
  }

  if (!_matchesPartialReturnLogReference(query)) {
    return NO_RESULTS
  }

  return FetchReturnLogSearchResultsService.go(query, page, false)
}

async function _partialUserSearchResults(query, resultType, page) {
  if (resultType && resultType !== 'user') {
    return NO_RESULTS
  }

  return FetchUserSearchResultsService.go(query, page, false)
}

function _searchResults(searchResults) {
  const [licences, monitoringStations, returnLogs, users] = searchResults

  return {
    amountFound:
      licences.results.length + monitoringStations.results.length + returnLogs.results.length + users.results.length,
    licences,
    monitoringStations,
    returnLogs,
    users
  }
}

module.exports = {
  go
}
