'use strict'

/**
 * Handles finding a single matching result for a search query from the /search page
 * @module FindSingleSearchMatchService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Handles finding a single matching result for a search query from the /search page
 *
 * A user may enter an exact reference for a licence. When this happens, we want to check if there is a  matching record
 * and redirect them straight to the page for displaying that record, rather than showing them a list of
 * search results.
 *
 * @param {string} searchQuery - The value to search for
 *
 * @returns {Promise<string>} The URL to redirect to, or null if there is no single matching result
 */
async function go(searchQuery) {
  return _redirectForLicence(searchQuery)
}

async function _redirectForLicence(searchQuery) {
  // We only need to know if there's more than one potential match, so limit the results to two
  const licences = await LicenceModel.query().where('licenceRef', 'ilike', `%${searchQuery}%`).limit(2)

  if (licences.length === 1 && licences[0].licenceRef.toLowerCase() === searchQuery.toLowerCase()) {
    return `/system/licences/${licences[0].id}/summary`
  }

  return null
}

module.exports = {
  go
}
