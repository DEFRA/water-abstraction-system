import { checkUrl } from '../../../lib/check-page.lib.js'

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
export default function go(session) {
  const { id: sessionId, label, stopOrReduce, reduceAtThreshold } = session

  return {
    backLink: checkUrl(session, `/system/licence-monitoring-station/setup/${session.id}/threshold-and-unit`),
    monitoringStationLabel: label,
    pageTitle: 'Does the licence holder need to stop or reduce at this threshold?',
    reduceAtThreshold: reduceAtThreshold ?? null,
    sessionId,
    stopOrReduce: stopOrReduce ?? null
  }
}
