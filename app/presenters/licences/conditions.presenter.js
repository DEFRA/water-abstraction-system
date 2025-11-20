'use strict'

/**
 * Formats the licence and related conditions data for the licence conditions page
 * @module ConditionsPresenter
 */

const { pluralise } = require('./base-licences.presenter.js')

/**
 * Formats the licence and related conditions data for the licence conditions page
 *
 * @param {object} licenceVersionPurposeConditionTypes - The licence and related conditions data returned by `FetchLicenceConditionsService`
 *
 * @returns {object} licence and conditions data needed by the view template
 */
function go(licenceVersionPurposeConditionTypes) {
  const { id: licenceId, licenceRef } = licenceVersionPurposeConditionTypes.licence
  const conditionTypes = _conditionTypes(licenceVersionPurposeConditionTypes.conditions)

  return {
    backLink: {
      href: `/system/licences/${licenceId}/summary`,
      text: 'Go back to summary'
    },
    conditionTypes,
    pageTitle: 'Conditions',
    pageTitleCaption: `Licence ${licenceRef}`,
    showingConditions: `Showing ${conditionTypes.length}  ${pluralise('type', conditionTypes.length)} of further conditions`,
    warning: {
      text: 'We may not be able to show a full list of the conditions, because we do not hold all of the licence information on our system yet. You should refer to the paper copy of the licence to view all conditions.',
      iconFallbackText: 'Warning'
    }
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
  const { description, param1Label, param2Label, subcodeDescription } = conditionType

  return licenceVersionPurposeConditions.map((licenceVersionPurposeCondition) => {
    const { licenceVersionPurpose, notes, param1, param2 } = licenceVersionPurposeCondition

    return {
      abstractionPoints: _abstractionPoints(licenceVersionPurpose.licenceVersionPurposePoints),
      conditionType: description,
      otherInformation: notes ? notes.trim() : null,
      param1: _param(param1Label, param1, 1),
      param2: _param(param2Label, param2, 2),
      purpose: licenceVersionPurpose.purpose.description,
      subcodeDescription
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
