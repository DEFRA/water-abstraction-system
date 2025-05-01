'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alert/alert-thresholds` page
 * @module AlertThresholdsPresenter
 */

const { titleCase } = require('../../../base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alert/alert-thresholds` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  return {
    backLink: `/system/notices/setup/${session.monitoringStationId}/abstraction-alerts/alert-type`,
    caption: session.monitoringStationName,
    pageTitle: 'Which thresholds do you need to send an alert for?',
    thresholdOptions: _thresholdOptions(session.licenceMonitoringStations, session.alertThresholds)
  }
}

function _thresholdOptions(licenceMonitoringStations, alertThresholds = []) {
  return licenceMonitoringStations.map((licenceMonitoringStation) => {
    return {
      checked: alertThresholds.includes(licenceMonitoringStation.id),
      value: licenceMonitoringStation.id,
      text: `${licenceMonitoringStation.threshold_value} ${licenceMonitoringStation.threshold_unit}`,
      hint: {
        text: `${titleCase(licenceMonitoringStation.measure_type)} thresholds for this station (${licenceMonitoringStation.threshold_unit})`
      }
    }
  })
}

module.exports = {
  go
}
