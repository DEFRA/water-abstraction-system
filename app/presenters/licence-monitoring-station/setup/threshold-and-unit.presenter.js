'use strict'

/**
 * Format data for the `/licence-monitoring-station/setup/{sessionId}/threshold-and-unit` page
 * @module ThresholdAndUnitPresenter
 */

const { thresholdUnits } = require('../../../lib/static-lookups.lib.js')

/**
 * Format data for the `/licence-monitoring-station/setup/{sessionId}/threshold-and-unit` page
 *
 * @param {module:SessionModel} session - The licence monitoring station setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, label, unit: sessionUnit, threshold } = session

  return {
    backLink: _backLink(session),
    displayUnits: _units(sessionUnit),
    monitoringStationLabel: label,
    pageTitle: 'What is the licence hands-off flow or level threshold?',
    sessionId,
    threshold: threshold ?? null
  }
}

function _backLink(session) {
  const { checkPageVisited, id, monitoringStationId } = session

  if (checkPageVisited) {
    return `/system/licence-monitoring-station/setup/${id}/check`
  }

  return `/system/monitoring-stations/${monitoringStationId}`
}

function _units(sessionUnit) {
  return Object.entries(thresholdUnits).map(([_key, { label, value }]) => {
    return {
      hint: {
        text: label
      },
      value,
      checked: sessionUnit === value,
      text: value
    }
  })
}

module.exports = {
  go
}
