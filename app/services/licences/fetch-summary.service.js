'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/summary` page
 * @module FetchSummaryService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the matching licence and return data needed for the view licence page summary tab
 *
 * Was built to provide the data needed for the '/licences/{id}/summary' page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<module:LicenceModel>} the data needed to populate the view licence page summary tab
 */
async function go(licenceId) {
  return _fetch(licenceId)
}

async function _fetch(licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select(['expiredDate', 'id', 'startDate', 'issueDate'])
    .modify('licenceName')
    .modify('primaryUser')
    .modify('currentVersion')
    .withGraphFetched('region')
    .modifyGraph('region', (regionBuilder) => {
      regionBuilder.select(['id', 'displayName'])
    })
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (licenceVersionsBuilder) => {
      licenceVersionsBuilder
        .withGraphFetched('licenceVersionHolder')
        .modifyGraph('licenceVersionHolder', (licenceVersionHolderBuilder) => {
          licenceVersionHolderBuilder.select(['id', 'forename', 'holderType', 'initials', 'name', 'salutation'])
        })
        .withGraphFetched('licenceVersionPurposes')
        .modifyGraph('licenceVersionPurposes', (licenceVersionPurposesBuilder) => {
          licenceVersionPurposesBuilder
            .select([
              'id',
              'abstractionPeriodStartDay',
              'abstractionPeriodStartMonth',
              'abstractionPeriodEndDay',
              'abstractionPeriodEndMonth',
              'annualQuantity',
              'dailyQuantity',
              'hourlyQuantity',
              'instantQuantity'
            ])
            .withGraphFetched('points')
            .modifyGraph('points', (pointsBuilder) => {
              pointsBuilder
                .select(['points.description', 'points.id', 'points.ngr1', 'points.ngr2', 'points.ngr3', 'points.ngr4'])
                .withGraphFetched('source')
                .modifyGraph('source', (sourceBuilder) => {
                  sourceBuilder.select(['sources.description', 'sources.id'])
                })
            })
            .withGraphFetched('purpose')
            .modifyGraph('purpose', (purposeBuilder) => {
              purposeBuilder.select(['id', 'description'])
            })
            .withGraphFetched('licenceVersionPurposeConditions')
            .modifyGraph('licenceVersionPurposeConditions', (licenceVersionPurposeConditionsBuilder) => {
              licenceVersionPurposeConditionsBuilder
                .select(['id'])
                .withGraphFetched('licenceVersionPurposeConditionType')
                .modifyGraph('licenceVersionPurposeConditionType', (licenceVersionPurposeConditionTypeBuilder) => {
                  licenceVersionPurposeConditionTypeBuilder.select(['id', 'displayTitle'])
                })
            })
        })
    })
    .withGraphFetched('licenceMonitoringStations')
    .modifyGraph('licenceMonitoringStations', (licenceMonitoringStationsBuilder) => {
      licenceMonitoringStationsBuilder
        .select(['id'])
        .whereNull('deletedAt')
        .withGraphFetched('monitoringStation')
        .modifyGraph('monitoringStation', (monitoringStationBuilder) => {
          monitoringStationBuilder.select(['id', 'label'])
        })
    })
    .withGraphFetched('workflows')
    .modifyGraph('workflows', (workflowsBuilder) => {
      workflowsBuilder.select(['id', 'status']).whereNull('deletedAt')
    })
}

module.exports = {
  go
}
