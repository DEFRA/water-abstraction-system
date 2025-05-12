'use strict'

/**
 * Format data for the `/monitoring-stations/{monitoringStationId}/licence/{licenceId}` page
 * @module LicencePresenter
 */

const { thresholdUnits } = require('../../lib/static-lookups.lib.js')

/**
 * Format data for the `/monitoring-stations/{monitoringStationId}/licence/{licenceId}` page
 *
 * @param {module:LicenceMonitoringStationModel} licenceMonitoringStation - The licence monitoring station and
 * associated data
 *
 * @returns {object} page data needed by the view template
 */
function go(licenceMonitoringStation) {
  const { id: sessionId, label, unit: sessionUnit, threshold } = licenceMonitoringStation

  return {
    backLink: _backLink(licenceMonitoringStation),
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
