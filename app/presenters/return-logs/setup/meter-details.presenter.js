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
  const {
    id: sessionId,
    returnReference,
    meterDetailsMake,
    meterDetailsSerialNumber,
    meterDetails10TimesDisplay
  } = session

  return {
    backLink: `/system/return-logs/setup/${sessionId}/meter-provided`,
    meterDetailsMake: meterDetailsMake ?? null,
    meterDetailsSerialNumber: meterDetailsSerialNumber ?? null,
    meterDetails10TimesDisplay: meterDetails10TimesDisplay ?? null,
    pageTitle: 'Meter details',
    returnReference,
    sessionId
  }
}

module.exports = {
  go
}
