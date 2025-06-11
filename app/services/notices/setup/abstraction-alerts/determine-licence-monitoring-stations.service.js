'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 * @module DetermineLicenceMonitoringStationsService
 */

const FetchLicenceMonitoringStationsService = require('./fetch-monitoring-station.service.js')

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 *
 * @param {string} id
 * @returns {Promise<{object}>}
 */
async function go(id) {
  const monitoringStation = await FetchLicenceMonitoringStationsService.go(id)

  return {
    licenceMonitoringStations: _licenceMonitoringStations(monitoringStation.licenceMonitoringStations),
    monitoringStationId: id,
    monitoringStationRiverName: monitoringStation.riverName,
    monitoringStationName: monitoringStation.label
  }
}

function _licenceMonitoringStations(licenceMonitoringStations) {
  return licenceMonitoringStations.map((licenceMonitoringStation) => {
    const { licenceVersionPurposeCondition, ...rest } = licenceMonitoringStation

    return {
      ...rest,
      ..._licenceVersionPurpose(licenceVersionPurposeCondition),
      notes: _notes(licenceVersionPurposeCondition),
      thresholdGroup: _thresholdGroup(rest.measureType, rest.thresholdValue, rest.thresholdUnit)
    }
  })
}

function _licenceVersionPurpose(licenceVersionPurposeCondition) {
  if (licenceVersionPurposeCondition?.licenceVersionPurpose) {
    return licenceVersionPurposeCondition.licenceVersionPurpose
  } else {
    return {}
  }
}

/**
 * Notes are used in the personalisation for notify.
 *
 * Nots can be:
 *  - a string
 *  - null
 *
 * Here are some examples from NALD where the notes are set (they may not look 'correct' but we still set them):
 * - `"                   "             "                    "`
 * - '\n'
 * - '-'
 *
 * @private
 */
function _notes(licenceVersionPurposeCondition) {
  return licenceVersionPurposeCondition?.notes && licenceVersionPurposeCondition?.notes.length > 0
    ? licenceVersionPurposeCondition.notes
    : null
}

/**
 * Each threshold group key is a string formatted as: `${measureType}-${thresholdValue}-${thresholdUnit}`.
 * For example: `'flow-100-m'`.
 *
 * These are not unique and can/ will occur multiple times. When a threshold/s is selected by the user we use this key
 * to find all the relevant licence monitoring stations data.
 *
 * @returns {string}
 * @private
 */
function _thresholdGroup(measureType, thresholdValue, thresholdUnit) {
  return `${measureType}-${thresholdValue}-${thresholdUnit}`
}

module.exports = {
  go
}
