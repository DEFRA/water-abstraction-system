'use strict'

/**
 * Fetches the licence purposes needed for the licence purposes page
 * @module FetchLicencePurposesService
 */

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches the licence purposes needed for the licence purposes page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<module:LicenceModel>} the licence and related licence purposes data needed for the view licence
 * purposes page
 */
async function go (licenceId) {
  return _fetchLicencePurposes(licenceId)
}

async function _fetchLicencePurposes (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef'
    ])
    .modify('currentVersion')
    .withGraphFetched('licenceVersions.licenceVersionPurposes')
    .modifyGraph('licenceVersions.licenceVersionPurposes', (builder) => {
      builder.select([
        'abstractionPeriodStartDay',
        'abstractionPeriodStartMonth',
        'abstractionPeriodEndDay',
        'abstractionPeriodEndMonth',
        'annualQuantity',
        'dailyQuantity',
        'hourlyQuantity',
        'instantQuantity'
      ])
        .orderBy('licenceVersionPurposes.createdAt', 'asc')
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
        .orderBy('points.externalId', 'asc')
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
}

module.exports = {
  go
}
