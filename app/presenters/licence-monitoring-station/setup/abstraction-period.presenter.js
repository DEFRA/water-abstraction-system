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
  const {
    abstractionPeriodStartDay,
    abstractionPeriodEndDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndMonth,
    label,
    licenceRef
  } = session

  return {
    abstractionPeriodStartDay,
    abstractionPeriodEndDay,
    abstractionPeriodStartMonth,
    abstractionPeriodEndMonth,
    backLink: _backLink(session),
    monitoringStationLabel: label,
    pageTitle: `Enter an abstraction period for licence ${licenceRef}`
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session
  let backLink

  if (checkPageVisited) {
    backLink = `/system/licence-monitoring-station/setup/${id}/check`
  } else {
    backLink = `/system/licence-monitoring-station/setup/${id}/full-condition`
  }

  return {
    href: backLink,
    text: 'Back'
  }
}

module.exports = {
  go
}
