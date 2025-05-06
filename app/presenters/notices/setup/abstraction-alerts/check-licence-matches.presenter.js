'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/abstraction-alert/check-licence-matches` page
 * @module CheckLicenceMatchesPresenter
 */

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

function _licences(alertThresholds, licenceMonitoringStations) {
  return licenceMonitoringStations.filter((lms) => {
    return alertThresholds.includes(lms.id)
  })
}

module.exports = {
  go
}
