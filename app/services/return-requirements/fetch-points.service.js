'use strict'

/**
 * Fetches the points data for a licence
 * @module FetchPointsService
 */

const { ref } = require('objection')

const LicenceModel = require('../../models/licence.model.js')

/**
 * Fetches the points data for a licence
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<object>} The points data for the matching licenceId
 */
async function go (licenceId) {
  const data = await _fetchPoints(licenceId)

  return data
}

async function _fetchPoints (licenceId) {
  const result = await LicenceModel.query()
    .findById(licenceId)
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

  // First extract from the current_version's purposes the various points
  result.purposes.forEach((purpose) => {
    purpose.purposePoints.forEach((point) => {
      const pointDetail = point.point_detail

      pointsData.push(pointDetail)
    })
  })

  // Then sort the extracted points to give us a consistent display order and return
  return pointsData.sort((first, second) => {
    // NOTE: This ensures we don't call localeCompare with null or undefined values
    const firstLocalName = first.LOCAL_NAME ? first.LOCAL_NAME : ''
    const secondLocalName = second.LOCAL_NAME ? second.LOCAL_NAME : ''

    // NOTE: localeCompare() handles dealing with values in different cases automatically! So we don't have to lowercase
    // everything before then comparing.
    return firstLocalName.localeCompare(secondLocalName)
  })
}

module.exports = {
  go
}
