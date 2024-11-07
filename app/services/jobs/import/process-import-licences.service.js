'use strict'

/**
 * Process import licences
 * @module ProcessImportLicences
 */

const ProcessImportLicence = require('./process-import-licence.service.js')
const config = require('../../../../config/jobs.config.js')
const { batchSize } = config.importLicence

/**
 * Process import licences
 *
 * Batches the licences process into small chunks to reduce strain on the system
 *
 * @param {object[]} licences - an array of licences
 */
async function go (licences) {
  for (let i = 0; i < licences.length; i += batchSize) {
    const batch = licences.slice(i, i + batchSize)

    await _processBatch(batch)
  }
}

async function _processBatch (batch) {
  await Promise.all(
    batch.map(async (
      licence) => {
      await ProcessImportLicence.go(licence)
    })
  )
}

module.exports = {
  go
}
