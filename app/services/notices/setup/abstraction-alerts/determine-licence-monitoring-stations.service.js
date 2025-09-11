'use strict'

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 * @module DetermineLicenceMonitoringStationsService
 */

const FetchMonitoringStationDetailsService = require('../../../monitoring-stations/fetch-monitoring-station-details.service.js')

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 *
 * @param {string} id
 * @returns {Promise<{object}>}
 */
async function go(id) {
  const { licenceMonitoringStations, monitoringStation } = await FetchMonitoringStationDetailsService.go(id)

  return {
    licenceMonitoringStations: _licenceMonitoringStations(licenceMonitoringStations),
    monitoringStationId: id,
    monitoringStationRiverName: monitoringStation.riverName,
    monitoringStationName: monitoringStation.label
  }
}

function _abstractionPeriod(licenceMonitoringStation) {
  const licenceVersionPurpose = licenceMonitoringStation?.licenceVersionPurposeCondition?.licenceVersionPurpose

  if (licenceVersionPurpose) {
    const {
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth,
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth
    } = licenceVersionPurpose

    return {
      abstractionPeriodEndDay,
      abstractionPeriodEndMonth,
      abstractionPeriodStartDay,
      abstractionPeriodStartMonth
    }
  }

  const { abstractionPeriodEndDay, abstractionPeriodEndMonth, abstractionPeriodStartDay, abstractionPeriodStartMonth } =
    licenceMonitoringStation

  return {
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth
  }
}

function _licenceMonitoringStations(licenceMonitoringStations) {
  return licenceMonitoringStations.map((licenceMonitoringStation) => {
    const { id, latestNotification, licence, measureType, restrictionType, thresholdUnit, thresholdValue } =
      licenceMonitoringStation

    return {
      id,
      latestNotification,
      licence,
      measureType,
      restrictionType,
      thresholdUnit,
      thresholdValue,
      ..._abstractionPeriod(licenceMonitoringStation),
      notes: _notes(licenceMonitoringStation),
      thresholdGroup: _thresholdGroup(measureType, thresholdValue, thresholdUnit)
    }
  })
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
function _notes(licenceMonitoringStation) {
  const { licenceVersionPurposeCondition } = licenceMonitoringStation

  return licenceVersionPurposeCondition?.notes.length > 0 ? licenceVersionPurposeCondition.notes : null
}

/**
 * Each threshold group key is a string formatted as: `${measureType}-${thresholdValue}-${thresholdUnit}`.
 * For example: `'flow-100-m'`.
 *
 * These are not unique and can/ will occur multiple times. When a threshold/s is selected by the user we use this key
 * to find all the relevant licence monitoring stations data.
 *
 * @private
 */
function _thresholdGroup(measureType, thresholdValue, thresholdUnit) {
  return `${measureType}-${thresholdValue}-${thresholdUnit}`
}

module.exports = {
  go
}
