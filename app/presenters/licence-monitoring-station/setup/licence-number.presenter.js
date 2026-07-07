import { checkUrl } from '../../../lib/check-page.lib.js'

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
  const { label, licenceRef } = session

  return {
    backLink: checkUrl(session, `/system/licence-monitoring-station/setup/${session.id}/stop-or-reduce`),
    licenceRef,
    monitoringStationLabel: label,
    pageTitle: 'Enter the licence number this threshold applies to'
  }
}

export {
  go
}
export default {
  go
}
