'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alert/check-licence-matches` page
 * @module CheckLicenceMatchesPresenter
 */

const { formatAbstractionPeriod } = require('../../../base.presenter.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alert/check-licence-matches` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { alertThresholds, licenceMonitoringStations } = session
  return {
    licences: _licences(alertThresholds, licenceMonitoringStations)
  }
}

function _threshold(licenceMonitoringStation) {
  return {
    abstractionPeriod: formatAbstractionPeriod(
      licenceMonitoringStation.abstraction_period_start_day,
      licenceMonitoringStation.abstraction_period_start_month,
      licenceMonitoringStation.abstraction_period_end_month,
      licenceMonitoringStation.abstraction_period_end_month
    ),
    flow: licenceMonitoringStation.restriction_type,
    threshold: `${licenceMonitoringStation.threshold_value} ${licenceMonitoringStation.threshold_unit}`
  }
}

/**
 * Groups licence monitoring stations by licence reference and collects threshold data for stations whose IDs match the
 * provided alert thresholds.
 *
 * @private
 */
function _licences(alertThresholds, licenceMonitoringStations) {
  const grouped = {}

  for (const licenceMonitoringStation of licenceMonitoringStations) {
    if (alertThresholds.includes(licenceMonitoringStation.id)) {
      const key = licenceMonitoringStation.licence_ref

      if (!grouped[key]) {
        grouped[key] = {
          licenceRef: key,
          thresholds: []
        }
      }

      grouped[key].thresholds.push(_threshold(licenceMonitoringStation))
    }
  }

  return Object.values(grouped)
}

module.exports = {
  go
}
