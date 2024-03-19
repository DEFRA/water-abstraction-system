'use strict'

/**
 * Fetches points descriptions needed for `/return-requirements/{sessionId}/points` page
 * @module FetchPointsService
 */

const { ref } = require('objection')

const LicenceModel = require('../../models/licence.model.js')

async function go (licenceId) {
  const data = await _fetchPoints(licenceId)

  return data
}

async function _fetchPoints (licenceId) {
  const result = await LicenceModel.query()
    .findById(licenceId)
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
        ref('licenceDataValue:data.current_version.purposes').as('purposes')
      ])
    })

  return result.permitLicence
}

module.exports = {
  go
}
