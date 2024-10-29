'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/summary` page
 * @module FetchLicenceSummaryService
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
async function go (licenceId) {
  return _fetch(licenceId)
}

async function _fetch (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'expiredDate',
      'startDate'
    ])
    .modify('currentVersion')
    .modify('licenceHolder')
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })
    .withGraphFetched('licenceDocumentHeader')
    .modifyGraph('licenceDocumentHeader', (builder) => {
      builder.select([
        'id'
      ])
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes')
    .modifyGraph('licenceVersions.licenceVersionPurposes', (builder) => {
      builder.select([
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
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes.points')
    .modifyGraph('licenceVersions.licenceVersionPurposes.points', (builder) => {
      builder.select([
        'points.description',
        'points.id',
        'points.ngr1',
        'points.ngr2',
        'points.ngr3',
        'points.ngr4'
      ])
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes.points.source')
    .modifyGraph('licenceVersions.licenceVersionPurposes.points.source', (builder) => {
      builder.select([
        'sources.description',
        'sources.id'
      ])
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes.purpose')
    .modifyGraph('licenceVersions.licenceVersionPurposes.purpose', (builder) => {
      builder.select([
        'id',
        'description'
      ])
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions')
    .modifyGraph('licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions', (builder) => {
      builder.select([
        'id'
      ])
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions.licenceVersionPurposeConditionType')
    .modifyGraph('licenceVersions.licenceVersionPurposes.licenceVersionPurposeConditions.licenceVersionPurposeConditionType', (builder) => {
      builder.select([
        'id',
        'displayTitle'
      ])
    })
    .withGraphFetched('licenceMonitoringStations')
    .modifyGraph('licenceMonitoringStations', (builder) => {
      builder.select([
        'id'
      ])
        .whereNull('deletedAt')
    })
    .withGraphFetched('licenceMonitoringStations.monitoringStation')
    .modifyGraph('licenceMonitoringStations.monitoringStation', (builder) => {
      builder.select([
        'id',
        'label'
      ])
    })
}

module.exports = {
  go
}
