'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/meter-details` page
 * @module MeterDetailsPresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/meter-details` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, returnReference, meterMake, meterSerialNumber, meter10TimesDisplay } = session

  return {
    backLink: _backLink(session),
    meterMake: meterMake ?? null,
    meterSerialNumber: meterSerialNumber ?? null,
    meter10TimesDisplay: meter10TimesDisplay ?? null,
    pageTitle: 'Meter details',
    returnReference,
    sessionId
  }
}

function _backLink(session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-logs/setup/${id}/check`
  }

  return `/system/return-logs/setup/${id}/meter-provided`
}

module.exports = {
  go
}
