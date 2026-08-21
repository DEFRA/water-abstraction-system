/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 * @module AlertThresholdsPresenter
 */

import { unitConversion } from 'water-abstraction-engine/lib/static-lookups.lib.js'
import { formatValueUnit, titleCase } from 'water-abstraction-engine/presenters/base.presenter.js'

import DetermineRelevantLicenceMonitoringStationsByAlertTypeService from '../../../../services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations-by-alert-type.service.js'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
export default function alertThresholdsPresenter(session) {
  const {
    alertThresholds,
    alertType,
    id: sessionId,
    licenceMonitoringStations,
    monitoringStationName,
    removedThresholds
  } = session

  return {
    backLink: { href: `/system/notices/setup/${sessionId}/abstraction-alerts/alert-type`, text: 'Back' },
    pageTitle: 'Which thresholds do you need to send an alert for?',
    pageTitleCaption: monitoringStationName,
    thresholdOptions: _thresholdOptions(alertThresholds, alertType, licenceMonitoringStations, removedThresholds)
  }
}

/**
 * Returns a list of unique threshold group keys from the relevant licence monitoring stations.
 *
 * Each threshold group key is a string formatted as: `${measureType}-${thresholdValue}-${thresholdUnit}`.
 * For example: `'flow-100-m'`.
 *
 * @returns {string[]} Unique threshold group identifiers
 *
 * @private
 */
function _relevantThresholds(relevantLicenceMonitoringStations) {
  const thresholdGroups = relevantLicenceMonitoringStations.map((relevantLicenceMonitoringStation) => {
    return relevantLicenceMonitoringStation.thresholdGroup
  })

  return [...new Set(thresholdGroups)]
}

/**
 * Sorts a list of threshold identifiers by measurement type and quantity
 *
 * Each threshold in the array follows the format `${measureType}-${thresholdValue}-${thresholdUnit}`,
 * for example: 'flow-1000-m3/d' or 'level-5-mAOD'.
 *
 * The sorting logic works as follows:
 * - Measurement type priority: Thresholds are sorted with flow entries appearing before level entries.
 *
 * - Normalised quantity: Within each measurement type, the thresholds are numerically sorted based on the actual
 * quantity they represent, using the `UNIT_CONVERSION` map to normalise different units to a common base (metres per
 * second).
 *
 * - For level-related thresholds (e.g. m, mAOD, mASD), no unit scaling is necessary and are all treated as having a
 * multiplier of 1.
 *
 * @param {string[]} relevantThresholds - An array of thresholds
 * @returns {string[]} The sorted array of thresholds
 */
function _sortedThresholds(relevantThresholds) {
  const sortedThresholds = relevantThresholds.slice().sort((a, b) => {
    const [typeA, valueA, unitA] = a.split('-')
    const [typeB, valueB, unitB] = b.split('-')

    const typeOrder = ['flow', 'level']
    const typeCompare = typeOrder.indexOf(typeA) - typeOrder.indexOf(typeB)

    if (typeCompare !== 0) {
      return typeCompare
    }

    const multiplierA = unitConversion[unitA] ?? 1
    const multiplierB = unitConversion[unitB] ?? 1

    const normalisedA = Number.parseFloat(valueA) * multiplierA
    const normalisedB = Number.parseFloat(valueB) * multiplierB

    return normalisedB - normalisedA
  })

  return sortedThresholds
}

/**
 * Builds threshold options based on grouped threshold identifiers.
 *
 * Each threshold group key has the format: `${measureType}-${thresholdValue}-${thresholdUnit}`
 * (e.g. `'flow-100-m'`). These are used to construct UI options with labels, hints, and checked states.
 *
 * @private
 */
function _thresholdOptions(alertThresholds, alertType, licenceMonitoringStations, removedThresholds) {
  const relevantLicenceMonitoringStations = DetermineRelevantLicenceMonitoringStationsByAlertTypeService(
    alertType,
    licenceMonitoringStations,
    removedThresholds
  )

  const relevantThresholds = _relevantThresholds(relevantLicenceMonitoringStations)

  const sortedThresholds = _sortedThresholds(relevantThresholds)

  return sortedThresholds.map((thresholdGroup) => {
    const [measureType, thresholdValue, thresholdUnit] = thresholdGroup.split('-')

    return {
      checked: alertThresholds ? alertThresholds.includes(thresholdGroup) : false,
      value: thresholdGroup,
      text: formatValueUnit(thresholdValue, thresholdUnit),
      hint: {
        text: `${titleCase(measureType)} threshold`
      }
    }
  })
}
