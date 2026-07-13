/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 * @module DetermineLicenceMonitoringStationsService
 */

import FetchMonitoringStationDetailsDal from '../../../../dal/monitoring-stations/fetch-monitoring-station-details.dal.js'

/**
 * Orchestrates fetching and formatting the data needed for the Monitoring station journey
 *
 * @param {string} id
 * @returns {Promise<{object}>}
 */
export default async function determineLicenceMonitoringStations(id) {
  const { licenceMonitoringStations, monitoringStation } = await FetchMonitoringStationDetailsDal(id)

  return {
    licenceMonitoringStations: _licenceMonitoringStations(licenceMonitoringStations),
    monitoringStationId: id,
    monitoringStationRiverName: monitoringStation.riverName,
    monitoringStationName: monitoringStation.label
  }
}

function _abstractionPeriod(licenceMonitoringStation) {
  return {
    abstractionPeriodEndDay: licenceMonitoringStation.abstractionPeriodEndDay,
    abstractionPeriodEndMonth: licenceMonitoringStation.abstractionPeriodEndMonth,
    abstractionPeriodStartDay: licenceMonitoringStation.abstractionPeriodStartDay,
    abstractionPeriodStartMonth: licenceMonitoringStation.abstractionPeriodStartMonth
  }
}

function _licenceMonitoringStations(licenceMonitoringStations) {
  const licenceMonitoringStationsWithActiveLicence = licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return !licenceMonitoringStation.licence.$ended()
  })

  return licenceMonitoringStationsWithActiveLicence.map((licenceMonitoringStation) => {
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
