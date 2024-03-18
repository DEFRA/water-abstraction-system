'use strict'

/**
 * Fetches points descriptions needed for `/return-requirements/{sessionId}/points` page
 * @module FetchPointsService
 */

const LicenceVersionPurposeConditionModel = require('../../models/licence-version-purpose-condition.model.js')

async function go (licenceId) {
  const data = await _fetchPoints(licenceId)

  return data
}

async function _fetchPoints (licenceId) {
  const result = await LicenceVersionPurposeConditionModel.query()
    .where('licenceVersionPurposeId', licenceId)
    .select([
      'id'
    ])
    .withGraphFetched('licenceVersionPurposeConditionTypes')
    .modifyGraph('licenceVersionPurposeConditionTypes', (builder) => {
      builder.select([
        'displayTitle'
      ])
    })

  return result
}
module.exports = {
  go
}
