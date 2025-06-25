'use strict'

/**
 * Fetches Licence and associated recordsfor the start of the return version setup process
 * @module FetchLicenceService
 */

const LicenceModel = require('../../../models/licence.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')

/**
 * Fetches the licence and associated records required for the start of the return version setup process
 *
 * @param {string} licenceId - The licence UUID to fetch the records for
 *
 * @returns {Promise<module:LicenceModel>} the licence and associated records
 */
async function go(licenceId) {
  return (
    LicenceModel.query()
      .findById(licenceId)
      .select(['id', 'expiredDate', 'lapsedDate', 'licenceRef', 'revokedDate', 'startDate', 'waterUndertaker'])
      .withGraphFetched('licenceVersions')
      .modifyGraph('licenceVersions', (licenceVersionsBuilder) => {
        licenceVersionsBuilder.select(['id', 'startDate']).where('status', 'current').orderBy('startDate', 'desc')
      })
      .withGraphFetched('returnVersions')
      .modifyGraph('returnVersions', (returnVersionsBuilder) => {
        returnVersionsBuilder
          .select(['id', 'startDate', 'reason'])
          .where('status', 'current')
          // A return version must include return requirements in order for us to be able to copy from it
          .whereExists(
            ReturnRequirementModel.query()
              .select(1)
              .whereColumn('returnVersions.id', 'returnRequirements.returnVersionId')
          )
          .orderBy('startDate', 'desc')
          .withGraphFetched('modLogs')
          .modifyGraph('modLogs', (modLogsBuilder) => {
            modLogsBuilder.select(['id', 'reasonDescription']).orderBy('externalId', 'asc')
          })
      })
      // See licence.model.js `static get modifiers` if you are unsure about what this is doing
      .modify('licenceHolder')
  )
}

module.exports = {
  go
}
