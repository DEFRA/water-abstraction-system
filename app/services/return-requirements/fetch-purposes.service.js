'use strict'

/**
 * @module FetchPurposesService
 */

const LicenceVersionModel = require('../../models/licence-version.model.js')

async function go (session) {
  const licenceId = session.data.licence.id
  const data = await _fetchPurpose(licenceId)

  return data
}

async function _fetchPurpose (licenceId) {
  const result = await LicenceVersionModel.query()
    .select('id')
    .where('licence_id', licenceId)
    .andWhere('status', 'current')
    .withGraphFetched('licenceVersionPurposes')
    .modifyGraph('licenceVersionPurposes', (builder) => {
      builder.select([
        'licenceVersionPurposes.purposeId'
      ])
    })
    .withGraphFetched('purposes')
    .modifyGraph('purposes', (builder) => {
      builder.select([
        'purposes.description'
      ])
    })

  const purposes = await _extractPurposes(result)

  return purposes
}

async function _extractPurposes (result) {
  const descriptions = []

  if (result[0] && result[0].purposes) {
    for (let i = 0; i < result[0].purposes.length; i++) {
      const description = result[0].purposes[i].description

      if (!descriptions.includes(description)) {
        descriptions.push(description)
      }
    }
  }

  return descriptions
}
module.exports = {
  go
}

// Licence Id
// licenceId = 08a4c9ea-e380-4266-b701-5b981bc0d005
// search licenceVersionId where status = 'current' && licenceId = '08a4c9ea-e380-4266-b701-5b981bc0d005' grab licenceVersionId
// licenceVersionId = 9c2d9b71-e09a-4ec5-b33a-1c21314d5175
// licenceVersionPurposes where licenceVersionId = '9c2d9b71-e09a-4ec5-b33a-1c21314d5175'
// 01/130/R01

// select p.description from licence_versions
// inner join licence_version_purposes lvp
// on licence_versions.id = lvp.licence_version_id
// inner join purposes p
// on lvp.purpose_id = p.id
// where licence_id  = '08a4c9ea-e380-4266-b701-5b981bc0d005' and status = 'current'
