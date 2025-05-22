'use strict'

/**
 * Formats data for the `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 * @module LicenceNumberPresenter
 */

/**
 * Formats data for the `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @param {module:SessionModel} session - The licence monitoring station setup session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { label } = session

  return {
    backLink: _backLink(session),
    monitoringStationLabel: label,
    pageTitle: 'Enter the licence number this threshold applies to'
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/licence-monitoring-station/setup/${id}/check`
  }

  return `/system/licence-monitoring-station/setup/${id}/stop-or-reduce`
}

module.exports = {
  go
}
