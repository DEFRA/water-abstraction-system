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
  const batchSize = 10

  for (let i = 0; i < licenceRefs.length; i += batchSize) {
    const batch = licenceRefs.slice(i, i + batchSize)

    await _processBatch(batch)
  }

  return true
}

async function _processBatch (batch) {
  await Promise.all(
    batch.map((
      licenceRef) => {
      return ProcessLicenceService.go(licenceRef)
    })
  )
}

module.exports = {
  go
}
