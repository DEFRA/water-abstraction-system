'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/summary` page
 * @module FetchLicenceSummaryService
 */

const { ref } = require('objection')

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the matching licence and return data needed for the view licence page summary tab
 *
 * Was built to provide the data needed for the '/licences/{id}/summary' page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page summary tab
 */
async function go (licenceId) {
  const licence = await _fetchLicence(licenceId)

  return {
    ...licence,
    licenceHolder: licence.$licenceHolder()
  }
}

async function _fetchLicence (licenceId) {
  const result = await LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'expiredDate',
      'startDate'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })
    .withGraphFetched('permitLicence')
    .modifyGraph('permitLicence', (builder) => {
      builder.select([
        'id',
        ref('licenceDataValue:data.current_version.purposes').as('purposes')
      ])
    })
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (builder) => {
      builder.select([
        'id'
      ])
        .where('status', 'current')
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes')
    .modifyGraph('licenceVersions.licenceVersionPurposes', (builder) => {
      builder.select([
        'id',
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth'
      ])
    })
    .withGraphFetched('licenceVersions.licenceVersionPurposes.purpose')
    .modifyGraph('licenceVersions.licenceVersionPurposes.purpose', (builder) => {
      builder.select([
        'id',
        'description'
      ])
    })
    .withGraphFetched('licenceGaugingStations')
    .modifyGraph('licenceGaugingStations', (builder) => {
      builder.select([
        'id'
      ])
        .whereNull('deletedAt')
    })
    .withGraphFetched('licenceGaugingStations.gaugingStation')
    .modifyGraph('licenceGaugingStations.gaugingStation', (builder) => {
      builder.select([
        'id',
        'label'
      ])
    })
    .modify('licenceHolder')
    .modify('registeredToAndLicenceName')

  return result
}

module.exports = {
  go
}
