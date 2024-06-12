'use strict'

/**
 * Determines if a licence has requirements
 * @module DetermineLicenceHasReturnVersionsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Determines if a licence has requirements
 *
 * @param {string} licenceId - The UUID for the licence id to fetch
 *
 * @returns {Promise<Boolean>} the result of check if a licence has requirements for returns
 */
async function go (licenceId) {
  const requirement = await _fetch(licenceId)

  return !!requirement
}

async function _fetch (licenceId) {
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
