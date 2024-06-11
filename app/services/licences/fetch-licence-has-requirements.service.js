'use strict'

/**
 * Fetches requirements for a licence and returns true or false if present
 * @module FetchLicenceHasRequirementsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Fetches requirements for a licence and returns true or false if present
 *
 * @param {string} licenceId - The UUID for the licence id to fetch
 *
 * @returns {Promise<Boolean>} the result of check if a licence has requirements for returns
 */
async function go (licenceId) {
  const requirement = await _fetch(licenceId)

  return !!requirement
}

async function _fetch (licenceId, page) {
  return ReturnVersionModel.query()
    .select([
      'id'
    ])
    .where('licenceId', licenceId)
    .first()
}

module.exports = {
  go
}
