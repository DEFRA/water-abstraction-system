'use strict'

/**
 * Fetches data needed for the view '/licences/{id}` page
 * @module FetchLicenceVersionPurposeConditionService
 */

const LicenceVersionPurposeCondtionModel = require('../../models/licence-version-purpose-condition.model.js')

/**
 * Fetch the matching licence version purpose conditions and return data needed for the view licence page
 *
 * @param {string} id The UUID for the licence_version_purpose_id to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page and some elements of the summary tab
 */
async function go (id) {
  const LicenceVersionPurposeCondition = await _fetchLicenceVersionPurposeCondition(id)
  const data = await _data(LicenceVersionPurposeCondition)

  return data
}

async function _data (licenceVersionPurposeConditions) {
  const abstractionConditions = []

  if (!licenceVersionPurposeConditions) {
    return abstractionConditions
  }

  licenceVersionPurposeConditions.forEach((purposeConditions) => {
    purposeConditions.licenceVersionPurposeConditionTypes.forEach((licenceVersionPurposeConditionType) => {
      abstractionConditions.push(licenceVersionPurposeConditionType.displayTitle)
    })
  })

  return {
    abstractionConditions: [...new Set(abstractionConditions)]
  }
}

async function _fetchLicenceVersionPurposeCondition (id) {
  const result = await LicenceVersionPurposeCondtionModel.query()
    .where('licenceVersionPurposeId', id)
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
