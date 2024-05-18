'use strict'

/**
 * Fetches data needed for the view `/return-requirements/{sessionId}/check` page
 * @module FetchLicenceSummaryService
 */

const { ref } = require('objection')

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetch the matching licence and return data needed for the view licence page summary tab
 *
 * Was built to provide the data needed for the `/return-requirements/{sessionId}/check` page
 *
 * @param {string} id The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page summary tab
 */
async function go (id) {
  const licence = await _fetchLicence(id)

  return licence
}

async function _fetchLicence (id) {
  const result = await LicenceModel.query()
    .findById(id)
    .select([
      'expiredDate',
      'id',
      'licenceRef',
      'startDate',
      'waterUndertaker'
    ])
    .withGraphFetched('permitLicence')
    .modifyGraph('permitLicence', (builder) => {
      builder.select([
        ref('licenceDataValue:data.current_version.purposes').as('purposes')
      ])
    })
    .withGraphFetched('licenceVersions')
    .modifyGraph('licenceVersions', (builder) => {
      builder.select(['licenceVersions.id'])
        .where('licenceVersions.status', 'current')
    })
    .withGraphFetched('licenceVersions.[licenceVersionPurposes, purposes]')
    .modifyGraph('[licenceVersionPurposes]', (builder) => {
      builder.select([
        'licenceVersionPurposes.abstractionPeriodStartDay',
        'licenceVersionPurposes.abstractionPeriodStartMonth',
        'licenceVersionPurposes.abstractionPeriodEndDay',
        'licenceVersionPurposes.abstractionPeriodEndMonth',
        'licenceVersionPurposes.licenceVersionId'
      ])
    })
    .modifyGraph('[purposes]', (builder) => {
      builder.select([
        'purposes.description'
      ])
    })

  return result
}

module.exports = {
  go
}
