'use strict'

/**
 * Process import licence
 * @module ProcessImportLicence
 */

const ProcessLicenceService = require('../../import/legacy/process-licence.service.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

/**
 * Process import licence
 *
 * Batches the licences process into small chunks to reduce strain on the system
 *
 * @param {string[]} licences - an array of licence ref
 */
async function go (licences) {
  const batchSize = 10

  const startTime = currentTimeInNanoseconds()

  for (let i = 0; i < licences.length; i += batchSize) {
    const batch = licences.slice(i, i + batchSize)

    await _processBatch(batch)
  }

  calculateAndLogTimeTaken(startTime, `Finished importing ${licences.length} licences from NALD`)
}

async function _processBatch (batch) {
  await Promise.all(
    batch.map((
      licence) => {
      return ProcessLicenceService.go(licence.licence_ref)
    })
  )
}

module.exports = {
  go
}
