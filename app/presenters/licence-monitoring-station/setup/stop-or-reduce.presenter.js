'use strict'

/**
 * Formats data for the `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 * @module StopOrReducePresenter
 */

/**
 * Formats data for the `/licence-monitoring-station/setup/{sessionId}/stop-or-reduce` page
 *
 * @param {module:SessionModel} session - The licence monitoring station setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, label, stopOrReduce, reduceAtThreshold } = session

  return {
    backLink: _backLink(session),
    monitoringStationLabel: label,
    pageTitle: 'Does the licence holder need to stop or reduce at this threshold?',
    reduceAtThreshold: reduceAtThreshold ?? null,
    sessionId,
    stopOrReduce: stopOrReduce ?? null
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/licence-monitoring-station/setup/${id}/check`
  }

  return `/system/licence-monitoring-station/setup/${id}/threshold-and-unit`
}

module.exports = {
  go
}
