'use strict'

/**
 * Fetches the matching licence and its licence ref needed for the view '/licences/{id}/*' pages
 * @module FetchLicenceRefService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches the matching licence and its licence ref needed for the view '/licences/{id}/*' pages
 *
 * The licence pages need to show the licence ref in the page heading.
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceModel>} the matching `LicenceModel` populated with the id and licence ref
 */
async function go(licenceId) {
  return LicenceModel.query().findById(licenceId).select(['id', 'licenceRef', 'includeInPresrocBilling'])
}

module.exports = {
  go
}
