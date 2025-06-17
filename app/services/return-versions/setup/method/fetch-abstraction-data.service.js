'use strict'

/**
 * Fetches a licence's abstraction data in order to generate new return requirements
 * @module FetchAbstractionDataService
 */

const LicenceModel = require('../../../../models/licence.model.js')

/**
 * Fetches a licence's abstraction data in order to generate new return requirements
 *
 * `GenerateFromAbstractionService` takes the result of this service and transforms it into return requirements.
 *
 * @param {string} licenceId - The UUID of the licence to fetch abstraction data from
 * @param {string} licenceVersionId - The UUID of the relevant licence version to generate the abstraction data from
 *
 * @returns {Promise<module:LicenceModel>} the matching licence model instance with abstraction data related properties
 * populated
 */
async function go(licenceId, licenceVersionId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select(['licences.id', 'licences.licenceRef', 'licences.waterUndertaker'])
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (licenceVersionsBuilder) => {
      licenceVersionsBuilder
        .select(['id', 'endDate', 'startDate'])
        .findById(licenceVersionId)
        .withGraphFetched('licenceVersionPurposes')
        .modifyGraph('licenceVersionPurposes', (licenceVersionPurposesBuilder) => {
          licenceVersionPurposesBuilder
            .select([
              'licenceVersionPurposes.id',
              'licenceVersionPurposes.abstractionPeriodEndDay',
              'licenceVersionPurposes.abstractionPeriodEndMonth',
              'licenceVersionPurposes.abstractionPeriodStartDay',
              'licenceVersionPurposes.abstractionPeriodStartMonth',
              'licenceVersionPurposes.dailyQuantity',
              'licenceVersionPurposes.externalId'
            ])
            // Use the Objection.js modifier we've added to LicenceVersionPurposeModel to retrieve the purpose, plus
            // primary and secondary against a licence version purpose
            .modify('allPurposes')
            .withGraphFetched('points')
            .modifyGraph('points', (pointsBuilder) => {
              pointsBuilder.select(['points.id', 'points.description'])
            })
        })
    })
}

module.exports = {
  go
}
