import { checkUrl } from '../../../lib/check-page.lib.js'

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
export default function (session) {
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
  return {
    href: checkUrl(session, `/system/licence-monitoring-station/setup/${session.id}/full-condition`),
    text: 'Back'
  }
}
