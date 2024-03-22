'use strict'

/**
 * Fetches data needed for the view '/licences/{id}` page
 * @module FetchLicenceVersionPurposeConditionService
 */

const LicenceVersionPurposeConditionModel = require('../../models/licence-version-purpose-condition.model.js')

/**
 * Fetch the matching licence version purpose conditions and return data needed for the view licence page
 *
 * @param {object} licenceData The object contains the response from the FetchLicenceService
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page and some elements of the summary tab
 */
async function go (licenceData) {
  const licenceVersionPurposeAndPurposeUseIds = []

  if (!licenceData ||
    licenceData?.licenceVersions === undefined ||
    licenceData.licenceVersions.length > 0 ||
    licenceData.licenceVersions[0]?.licenceVersionPurposes === undefined ||
    licenceData.licenceVersions[0]?.licenceVersionPurposes?.length === 0) {
    licenceData?.licenceVersions[0]?.licenceVersionPurposes.forEach((licenceVersionPurpose) => {
      licenceVersionPurposeAndPurposeUseIds.push({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        purposeId: licenceVersionPurpose.purposeId
      })
    })
  }

  if (licenceVersionPurposeAndPurposeUseIds.length === 0) {
    return {
      numberOfAbstractionConditions: 0,
      uniqueAbstractionConditionTitles: []
    }
  }

  const licenceVersionIds = []

  licenceVersionPurposeAndPurposeUseIds.forEach((item) => { licenceVersionIds.push(item.licenceVersionPurposeId) })

  const licenceVersionPurposeCondition = await _fetchLicenceVersionPurposeConditions(licenceVersionIds)
  const data = await _data(licenceVersionPurposeCondition, licenceVersionPurposeAndPurposeUseIds)

  return data
}

function _addUniqueAbstractionCondition (licenceVersionPurposeAndPurposeUseIds, abstractionConditions, purposeCondition) {
  // Get the purposeUseId from the LicenceVersionPurpose table using the licenceVersionPurposeId of the current purposeCondition
  const { purposeId: purposeUseId } = licenceVersionPurposeAndPurposeUseIds.find((item) => {
    return item.licenceVersionPurposeId === purposeCondition.licenceVersionPurposeId
  })

  // Loop through each of the condition types and check to see if there is already a set of those conditions in the array
  purposeCondition.licenceVersionPurposeConditionTypes.forEach((licenceVersionPurposeConditionType) => {
    if (!abstractionConditions.find((element) => {
      return element.displayTitle === licenceVersionPurposeConditionType.displayTitle &&
      element.purposeUseId === purposeUseId
    })) {
      abstractionConditions.push({
        displayTitle: licenceVersionPurposeConditionType.displayTitle,
        purposeUseId
      })
    }
  })
}

async function _data (licenceVersionPurposeConditions, licenceVersionPurposeAndPurposeUseIds) {
  const abstractionConditions = []

  if (licenceVersionPurposeConditions.length === 0) {
    return {
      numberOfAbstractionConditions: 0,
      uniqueAbstractionConditionTitles: []
    }
  }

  licenceVersionPurposeConditions.forEach((purposeCondition) => {
    _addUniqueAbstractionCondition(licenceVersionPurposeAndPurposeUseIds, abstractionConditions, purposeCondition)
  })

  const abstractionConditionDisplayTitles = []
  abstractionConditions.forEach((condition) => {
    abstractionConditionDisplayTitles.push(condition.displayTitle)
  })

  return {
    numberOfAbstractionConditions: abstractionConditions.length,
    uniqueAbstractionConditionTitles: [...new Set(abstractionConditionDisplayTitles)]
  }
}

async function _fetchLicenceVersionPurposeConditions (ids) {
  const result = await LicenceVersionPurposeConditionModel.query()
    .select([
      'id',
      'licenceVersionPurposeId'
    ])
    .whereIn('licenceVersionPurposeId', ids)
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
