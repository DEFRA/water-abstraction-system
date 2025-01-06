'use strict'

/**
 * Formats the licence and related conditions data for the view licence conditions page
 * @module ViewLicenceConditionsPresenter
 */

/**
 * Formats the licence and related conditions data for the view licence conditions page
 *
 * @param {object} licenceVersionPurposeConditionTypes - The licence and related conditions data returned by `FetchLicenceConditionsService`
 *
 * @returns {object} licence and conditions data needed by the view template
 */
function go(licenceVersionPurposeConditionTypes) {
  const { id: licenceId, licenceRef } = licenceVersionPurposeConditionTypes.licence
  const conditionTypes = _conditionTypes(licenceVersionPurposeConditionTypes.conditions)

  return {
    conditionTypes,
    licenceId,
    licenceRef,
    pageTitle: 'Licence abstraction conditions'
  }
}

function _abstractionPoints(licenceVersionPurposePoints) {
  const descriptions = licenceVersionPurposePoints.map((licenceVersionPurposePoint) => {
    return licenceVersionPurposePoint.point.$describe()
  })

  return {
    label: descriptions.length === 1 ? 'Abstraction point' : 'Abstraction points',
    descriptions
  }
}

function _conditionTypes(licenceVersionPurposeConditionTypes) {
  return licenceVersionPurposeConditionTypes.map((licenceVersionPurposeConditionType) => {
    const { displayTitle, licenceVersionPurposeConditions } = licenceVersionPurposeConditionType

    const conditions = _formatConditions(licenceVersionPurposeConditions, licenceVersionPurposeConditionType)

    return {
      conditions,
      displayTitle
    }
  })
}

function _formatConditions(licenceVersionPurposeConditions, conditionType) {
  const { description, param1Label, param2Label } = conditionType

  return licenceVersionPurposeConditions.map((licenceVersionPurposeCondition) => {
    const { licenceVersionPurpose, notes, param1, param2 } = licenceVersionPurposeCondition

    return {
      abstractionPoints: _abstractionPoints(licenceVersionPurpose.licenceVersionPurposePoints),
      conditionType: description,
      otherInformation: notes ? notes.trim() : null,
      param1: _param(param1Label, param1, 1),
      param2: _param(param2Label, param2, 2),
      purpose: licenceVersionPurpose.purpose.description
    }
  })
}

function _param(paramLabel, param, noteNumber) {
  // Label nor value set then we don't display the param
  if (!paramLabel && !param) {
    return null
  }

  return {
    label: paramLabel ?? `Note ${noteNumber}`,
    value: param
  }
}

module.exports = {
  go
}
