'use strict'

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 * @module AbstractionPeriodPresenter
 */

/**
 * Formats data for `/licence-monitoring-station/setup/{sessionId}/abstraction-period`
 *
 * @param {module:SessionModel} session - The licence monitoring station setup session instance
 *
 * @returns {object} The data formatted for the view template
 */
function go(session) {
  const { label, licenceRef } = session

  return {
    backLink: _backLink(session),
    monitoringStationLabel: label,
    pageTitle: `Enter an abstraction period for licence ${licenceRef}`
  }
}

// TODO: Fix logic for all 3 possible scenarios:
// - User came from licence number page, in which case back link should go to licence number page; this is done.
// - User came directly from check page, in which case back link should go to check page; this is also done.
// - User came from licence number page but prior to that they came from the check page; this is _NOT_ done as
//   currently, checkPageVisited will be true and they will therefore be returned to the check page. We need to fix this
//   but will do this one check page is in place so we can more easily develop and test this logic.
function _backLink(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/licence-monitoring-station/setup/${id}/check`
  }

  return `/system/licence-monitoring-station/setup/${id}/licence-number`
}

module.exports = {
  go
}
