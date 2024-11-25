'use strict'

/**
 * Determines if a licence has requirements
 * @module DetermineLicenceHasReturnVersionsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Determines if a licence has requirements
 *
 * @param {string} licenceId - The UUID of the licence to determine if return versions exist
 *
 * @returns {Promise<boolean>} true if the licence has return versions else false
 */
async function go(licenceId) {
  const requirement = await _fetch(licenceId)

  return !!requirement
}

async function _fetch(licenceId) {
  return ReturnVersionModel.query().select(['id']).where('licenceId', licenceId).limit(1).first()
}

module.exports = {
  go
}
