'use strict'

/**
 * Fetches points details needed for `/return-requirements/{sessionId}/points` page
 * @module FetchPointsService
 */

const { ref } = require('objection')

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches points details needed for `/return-requirements/{sessionId}/points` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} The points details for the matching licenceId
 */
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
        'id'
      ])
    })
    .withGraphFetched('permitLicence')
    .modifyGraph('permitLicence', (builder) => {
      builder.select([
        ref('licenceDataValue:data.current_version.purposes').as('purposes')
      ])
    })

  return _abstractPointsData(result.permitLicence)
}

function _abstractPointsData (result) {
  const pointsData = []

  result.purposes.forEach((purpose) => {
    purpose.purposePoints.forEach((point) => {
      const pointDetail = point.point_detail
      pointsData.push(pointDetail)
    })
  })

  return pointsData
}

module.exports = {
  go
}
