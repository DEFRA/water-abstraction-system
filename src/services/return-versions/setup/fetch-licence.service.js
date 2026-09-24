/**
 * Fetches the licence and associated records required for the start of the return version setup process
 * @module FetchLicenceService
 */

import LicenceModel from 'water-abstraction-engine/models/licence.model.js'
import ReturnRequirementModel from 'water-abstraction-engine/models/return-requirement.model.js'

/**
 * Fetches the licence and associated records required for the start of the return version setup process
 *
 * @param {string} licenceId - The licence UUID to fetch the records for
 *
 * @returns {Promise<module:LicenceModel>} the licence and associated records
 */
export default async function fetchLicenceService(licenceId) {
  return (
    LicenceModel.query()
      .findById(licenceId)
      .select(['id', 'expiredDate', 'lapsedDate', 'licenceRef', 'revokedDate', 'startDate', 'waterUndertaker'])
      // NOTE: This replicates the `licenceHolder` modifier in licence.model.js, minus its restriction to licence
      // versions that have started. A licence can be set up before it begins, in which case its only licence version
      // has a start date in the future and the modifier would return nothing for us to determine the licence holder or
      // current version start date from.
      .withGraphFetched('licenceVersions')
      .modifyGraph('licenceVersions', (licenceVersionsBuilder) => {
        licenceVersionsBuilder
          .select(['id', 'issueDate', 'licenceId', 'startDate', 'status'])
          // Limits the result to the single 'current' licence version, as ordered below
          .distinctOn('licenceId')
          .orderBy([
            { column: 'licenceId', order: 'asc' },
            { column: 'issue', order: 'desc' },
            { column: 'increment', order: 'desc' },
            { column: 'endDate', order: 'desc', nulls: 'first' }
          ])
      })
      .withGraphFetched('licenceVersions.company')
      .modifyGraph('licenceVersions.company', (companyBuilder) => {
        companyBuilder.select(['id', 'name', 'type'])
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
  )
}
