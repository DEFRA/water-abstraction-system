'use strict'

/**
 * Determines which items to search for a given query on the /search page
 * @module DetermineSearchItemsService
 */

const RESULT_TYPES = ['billingAccount', 'company', 'licence', 'monitoringStation', 'returnLog', 'user']

const MAX_LICENCE_LENGTH = 20

/**
 * Determines which items to search for a given query on the /search page
 *
 * Currently, the knowledge about the data types that we use to help this determination are:
 * - Billing account references are always of the format "A12345678A" where the first letter is a charge region
 * - Licence references are of the format "01/123/ABC" where there are numbers and letters and slashes, maybe with a few
 * other special characters, or are just 10 numeric digits
 * - Return references are actually numbers
 *
 * @param {string} query - The value to search for, taken from the session
 * @param {string} selectedResultType - The type of search result the user has selected, if any
 * @param {string[]} userScopes - The user's scopes
 *
 * @returns {string[]} The list of items to search for
 */
function go(query, selectedResultType, userScopes) {
  // Check if we've got a matching result type, otherwise default to all types the user has access to
  const resultTypeToUse = RESULT_TYPES.find((resultType) => {
    return resultType === selectedResultType
  })

  const resultTypes = []

  _billingAccounts(resultTypes, query, resultTypeToUse, userScopes)
  _companies(resultTypes, query, resultTypeToUse)
  _licences(resultTypes, query, resultTypeToUse)
  _monitoringStations(resultTypes, query, resultTypeToUse)
  _returnLogs(resultTypes, query, resultTypeToUse)
  _users(resultTypes, query, resultTypeToUse)

  return resultTypes
}

function _billingAccounts(resultTypes, query, selectedResultType, userScopes) {
  if (selectedResultType && selectedResultType !== 'billingAccount') {
    return
  }

  // Billing accounts can only be searched by users with the appropriate security scope
  if (!userScopes.includes('billing')) {
    return
  }

  // Billing account numbers are no longer than 10 characters and only contains numbers and certain letters
  if (!query.match(/^[ABENSTWY0-9]{1,10}$/i)) {
    return
  }

  // Billing account references are of the format "A12345678A" where the first letter is a charge region
  if (query.length === 10 && !query.match(/^[ABENSTWY]\d{8}A$/i)) {
    return
  }

  resultTypes.push('billingAccount')
}

function _companies(resultTypes, _query, selectedResultType) {
  if (selectedResultType && selectedResultType !== 'company') {
    return
  }

  // Current assumption is that a company name could contain pretty much anything as it is free text
  resultTypes.push('company')
}

function _licences(resultTypes, query, selectedResultType) {
  if (selectedResultType && selectedResultType !== 'licence') {
    return
  }

  // Licence references are no longer than 20 characters
  if (query.length > MAX_LICENCE_LENGTH) {
    return
  }

  // Licence references are alphanumeric, with slashes and stars and dots and hyphens
  if (!query.match(/^[a-z0-9/*.-]+$/i)) {
    return
  }

  // If there are three consecutive letters, it's not a licence reference
  if (query.match(/[a-z]{3}/i)) {
    return
  }

  resultTypes.push('licence')
}

function _monitoringStations(resultTypes, _query, selectedResultType) {
  if (selectedResultType && selectedResultType !== 'monitoringStation') {
    return
  }

  // Current assumption is that a monitoring station label could contain pretty much anything as it is free text
  resultTypes.push('monitoringStation')
}

function _returnLogs(resultTypes, query, selectedResultType) {
  if (selectedResultType && selectedResultType !== 'returnLog') {
    return
  }

  // Return references are no longer than 8 characters
  if (query.length > 8) {
    return
  }

  // Return references contain only numerical digits
  if (!query.match(/^\d+$/)) {
    return
  }

  resultTypes.push('returnLog')
}

function _users(resultTypes, _query, selectedResultType) {
  if (selectedResultType && selectedResultType !== 'user') {
    return
  }

  // Current assumption is that a username could contain pretty much any text as it is an email address
  resultTypes.push('user')
}

module.exports = {
  go
}
