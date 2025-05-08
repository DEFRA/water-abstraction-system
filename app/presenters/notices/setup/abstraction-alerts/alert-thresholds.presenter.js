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
    backLink: `/system/notices/setup/${session.id}/abstraction-alerts/alert-type`,
    caption: session.monitoringStationName,
    pageTitle: 'Which thresholds do you need to send an alert for?',
    thresholdOptions: _thresholdOptions(session.licenceMonitoringStations, session.alertType, session.alertThresholds)
  }
}

/**
 * Filters licence monitoring stations based on alert type.
 *
 * When the alert type is not 'stop' or 'reduce', all stations with any restriction are included.
 *
 * @private
 */
function _relevantLicenceMonitoringStations(licenceMonitoringStations, alertType) {
  if (alertType !== 'stop' && alertType !== 'reduce') {
    return licenceMonitoringStations
  }

  return licenceMonitoringStations.filter((licenceMonitoringStation) => {
    return licenceMonitoringStation.restrictionType === alertType
  })
}

function _thresholdOptions(licenceMonitoringStations, alertType, alertThresholds = []) {
  const relevantLicenceMonitoringStations = _relevantLicenceMonitoringStations(licenceMonitoringStations, alertType)

  return relevantLicenceMonitoringStations.map((licenceMonitoringStation) => {
    return {
      checked: alertThresholds.includes(licenceMonitoringStation.id),
      value: licenceMonitoringStation.id,
      text: `${licenceMonitoringStation.thresholdValue} ${licenceMonitoringStation.thresholdUnit}`,
      hint: {
        text: `${titleCase(licenceMonitoringStation.measureType)} thresholds for this station (${licenceMonitoringStation.thresholdUnit})`
      }
    }
  })
}

module.exports = {
  go
}
