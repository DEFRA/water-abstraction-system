'use strict'

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/check`
 * @module CheckPresenter
 */

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/check`
 *
 * @param {module:SessionModel} session - The licence monitoring station setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { label } = session

  return {
    monitoringStationLabel: label,
    pageTitle: 'Check the restriction details'
  }
}

module.exports = {
  go
}
