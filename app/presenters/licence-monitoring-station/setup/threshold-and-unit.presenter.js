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
  const mappedUnits = Object.entries(thresholdUnits).map(([_key, value]) => {
    return {
      value,
      text: value,
      selected: sessionUnit === value
    }
  })

  mappedUnits.push({
    value: 'select',
    text: 'Select an option',
    selected: sessionUnit === 'select' || sessionUnit === undefined
  })

  return mappedUnits
}

module.exports = {
  go
}
