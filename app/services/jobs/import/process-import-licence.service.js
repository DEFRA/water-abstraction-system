'use strict'

/**
 * Process import licence
 * @module ProcessImportLicence
 */

const DetermineSupplementaryBillingFlagsService = require('../../import/determine-supplementary-billing-flags.service.js')
const ProcessLicenceReturnLogsService = require('../return-logs/process-licence-return-logs.service.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

/**
 * Process import licence
 *
 * Batches the licences process into small chunks to reduce strain on the system
 *
 * @param {object[]} licences - an array of licences
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
    batch.map(async (
      licence) => {
      await DetermineSupplementaryBillingFlagsService.go(
        {
          expiredDate: licence.expired_date,
          lapsedDate: licence.lapsed_date,
          revokedDate: licence.revoked_date
        }, licence.id)
      await ProcessLicenceReturnLogsService.go(licence.id)
    })
  )
}

module.exports = {
  go
}
