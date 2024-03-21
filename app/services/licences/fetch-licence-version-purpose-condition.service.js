'use strict'

/**
 * Fetches data needed for the view '/licences/{id}` page
 * @module FetchLicenceVersionPurposeConditionService
 */

const LicenceVersionPurposeCondtionModel = require('../../models/licence-version-purpose-condition.model.js')

/**
 * Fetch the matching licence version purpose conditions and return data needed for the view licence page
 *
 * @param {object} ids The object contains the UUIDs for the licence_version_purpose_id and the purpose_id
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page and some elements of the summary tab
 */
async function go (ids) {
  if (!ids) {
    return {
      abstractionConditions: []
    }
  }

  const licenceVersionIds = []

  ids.forEach((item) => { licenceVersionIds.push(item.licenceVersionPurposeId) })

  const LicenceVersionPurposeCondition = await _fetchLicenceVersionPurposeCondition(licenceVersionIds)
  const data = await _data(LicenceVersionPurposeCondition, ids)

  return data
}

async function _data (licenceVersionPurposeConditions, licenceVersionPuroseAndPurposeUseIds) {
  const abstractionConditions = []

  if (!licenceVersionPurposeConditions) {
    return abstractionConditions
  }

  licenceVersionPurposeConditions.forEach((purposeCondition) => {
    // Get the purposeUseId from the LicenceVersionPurpose table using the licenceVersionPurposeId of the current purposeCondition
    const { purposeId: purposeUseId } = licenceVersionPuroseAndPurposeUseIds.find((item) =>
      item.licenceVersionPurposeId === purposeCondition.licenceVersionPurposeId)

    // Loop through each of the condition types and check to see if there is already a set of those conditions in the array
    purposeCondition.licenceVersionPurposeConditionTypes.forEach((licenceVersionPurposeConditionType) => {
      if (!abstractionConditions.find((element) =>
        element.displayTitle === licenceVersionPurposeConditionType.displayTitle &&
        element.purposeUseId === purposeUseId
      )) {
        abstractionConditions.push({
          displayTitle: licenceVersionPurposeConditionType.displayTitle,
          purposeUseId
        })
      }
    })
  })

  const abstractionConditionDisplayTitles = []
  abstractionConditions.forEach((condition) => {
    abstractionConditionDisplayTitles.push(condition.displayTitle)
  })

  return {
    numberOfAbstractionConditions: abstractionConditions.length,
    uniqueAbstractionConditions: [...new Set(abstractionConditionDisplayTitles)]
  }
}

async function _fetchLicenceVersionPurposeCondition (ids) {
  const result = await LicenceVersionPurposeCondtionModel.query()
    .whereIn('licenceVersionPurposeId', ids)
    .select([
      'id',
      'licenceVersionPurposeId'
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
