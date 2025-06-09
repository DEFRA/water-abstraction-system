'use strict'

/**
 * Format data for the `/licence-monitoring-station/{licenceMonitoringStationId}/remove` page
 * @module RemovePresenter
 */

const { sentenceCase } = require('../base.presenter.js')

/**
 * Format data for the `/licence-monitoring-station/{licenceMonitoringStationId}/remove` page
 *
 * @param {module:LicenceMonitoringStationModel} licenceMonitoringStation - The licence monitoring station and
 * associated data
 *
 * @returns {object} page data needed by the view template
 */
function go(licenceMonitoringStation) {
  const {
    licence,
    licenceVersionPurposeCondition,
    measureType,
    monitoringStation,
    restrictionType,
    thresholdUnit,
    thresholdValue
  } = licenceMonitoringStation

  return {
    backLink: `/system/monitoring-stations/${monitoringStation.id}/licence/${licence.id}`,
    licenceConditionTitle: `Hands off ${measureType} threshold`,
    licenceRef: licence.licenceRef,
    linkedCondition: _linkedConditionDetails(licenceVersionPurposeCondition),
    monitoringStationId: monitoringStation.id,
    pageTitle: 'You’re about to remove the tag for this licence',
    station: _monitoringStationName(monitoringStation),
    threshold: `${thresholdValue}${thresholdUnit}`,
    type: sentenceCase(restrictionType),
    Watercourse: monitoringStation.catchmentName
  }
}

function _linkedConditionDetails(licenceVersionPurposeCondition) {
  if (licenceVersionPurposeCondition) {
    const { externalId, licenceVersionPurposeConditionType } = licenceVersionPurposeCondition

    // Get the last set digits from the externalId
    const lastDigits = externalId.split(':').pop()

    return `${licenceVersionPurposeConditionType.displayTitle}, NALD ID ${lastDigits}`
  }

  return 'Not linked to a condition'
}

function _monitoringStationName(monitoringStation) {
  const { label, riverName } = monitoringStation

  if (riverName) {
    return `${riverName} at ${label}`
  }

  return label
}

module.exports = {
  go
}
