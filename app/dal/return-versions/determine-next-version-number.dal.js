'use strict'

/**
 * Determines the next version number for a new return version
 * @module DetermineNextVersionNumberDal
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Determines the next version number for a new return version
 *
 * @param {string} licenceId - The UUID of the licence to determine the next return version version number for
 *
 * @returns {Promise<number>} The next version number to use
 */
async function go(licenceId) {
  const { lastVersionNumber } = await ReturnVersionModel.query()
    .max('version as lastVersionNumber')
    .where({ licenceId })
    .first()

  if (lastVersionNumber) {
    return lastVersionNumber + 1
  }

  return 1
}

module.exports = {
  go
}
