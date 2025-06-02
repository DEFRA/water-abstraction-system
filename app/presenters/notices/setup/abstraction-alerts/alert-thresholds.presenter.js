'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 * @module AlertThresholdsPresenter
 */

const DetermineRelevantLicenceMonitoringStationsByAlertTypeService = require('../../../../services/notices/setup/abstraction-alerts/determine-relevant-licence-monitoring-stations-by-alert-type.service.js')
const { titleCase } = require('../../../base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alerts/alert-thresholds` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  return {
    backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`,
    caption: session.monitoringStationName,
    pageTitle: 'Which thresholds do you need to send an alert for?',
    thresholdOptions: _thresholdOptions(session.licenceMonitoringStations, session.alertType, session.alertThresholds)
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
 * Builds threshold options based on grouped threshold identifiers.
 *
 * Each threshold group key has the format: `${measureType}-${thresholdValue}-${thresholdUnit}`
 * (e.g. `'flow-100-m'`). These are used to construct UI options with labels, hints, and checked states.
 *
 * @private
 */
function _thresholdOptions(licenceMonitoringStations, alertType, alertThresholds = []) {
  const relevantLicenceMonitoringStations = DetermineRelevantLicenceMonitoringStationsByAlertTypeService.go(
    licenceMonitoringStations,
    alertType
  )

  const relevantThresholds = _relevantThresholds(relevantLicenceMonitoringStations)

  return relevantThresholds.map((relevantThreshold) => {
    const [measureType, thresholdValue, thresholdUnit] = relevantThreshold.split('-')

    return {
      checked: alertThresholds.includes(relevantThreshold),
      value: relevantThreshold,
      text: `${thresholdValue} ${thresholdUnit}`,
      hint: {
        text: `${titleCase(measureType)} threshold`
      }
    }
  })
}

module.exports = {
  go
}
