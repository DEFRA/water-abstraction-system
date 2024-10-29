'use strict'

/**
 * Process import licence
 * @module ProcessImportLicence
 */
const ProcessLicenceService = require('../../import/legacy/process-licence.service.js')

/**
 * Batches all the licences to be imported
 *
 * @param {string[]} licenceRefs - an array of licence ref
 */
async function go (licenceRefs) {
  for (const licenceRef of licenceRefs) {
    ProcessLicenceService.go(licenceRef)
  }

  return true
}

module.exports = {
  go
}
