'use strict'

/**
 * Handles finding a single matching result for a search query from the /search page
 *
 * @module FindSingleSearchMatchService
 */

const LicenceModel = require('../../models/licence.model.js')
const ReturnLogModel = require('../../models/return-log.model.js')

const RETURN_ID_PATTERN = /^v1:[1-8]:[^:]+:\d+:\d{4}-\d{2}-\d{2}:\d{4}-\d{2}-\d{2}$/

/**
 * Handles finding a single matching result for a search query from the /search page
 *
 * A user may enter an exact reference for a licence or a return. When this happens, we want to check if there is a
 * matching record and redirect them straight to the page for displaying that record, rather than showing them a list of
 * search results.
 *
 * @param {string} searchQuery - The value to search for
 *
 * @returns {Promise<string>} The URL to redirect to, or null if there is no single matching result
 */
async function go(searchQuery) {
  if (RETURN_ID_PATTERN.test(searchQuery)) {
    // If the search query matches the singularly unique pattern for a return ID, it's not going to be anything else.
    // So if we don't find a matching return, we'll just have to display the usual search results page.
    return _redirectForReturnLog(searchQuery)
  }

  return _redirectForLicence(searchQuery)
}

async function _redirectForLicence(searchQuery) {
  const licences = await LicenceModel.query()
    .where('licenceRef', 'ilike', `%${searchQuery}%`)
    .limit(2) // We only need to know if there's more than one potential match

  if (licences.length === 1 && licences[0].licenceRef.toLowerCase() === searchQuery.toLowerCase()) {
    return `/system/licences/${licences[0].id}/summary`
  }

  return null
}

async function _redirectForReturnLog(returnLogId) {
  const returnLog = await ReturnLogModel.query().findById(returnLogId)

  if (returnLog) {
    return `/system/return-logs?id=${returnLog.id}`
  } else {
    return null
  }
}

module.exports = {
  go
}
