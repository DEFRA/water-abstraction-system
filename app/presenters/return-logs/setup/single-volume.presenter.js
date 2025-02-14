'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/single-volume` page
 * @module SingleVolumePresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/single-volume` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, returnReference, singleVolume, singleVolumeQuantity, units } = session

  return {
    backLink: _backLink(session),
    pageTitle: 'Is it a single volume?',
    returnReference,
    sessionId,
    singleVolume: singleVolume ?? null,
    singleVolumeQuantity: singleVolumeQuantity ?? null,
    units: units === 'cubic-metres' ? 'cubic metres' : units
  }
}

function _backLink(session) {
  const { meterProvided, id } = session

  if (meterProvided === 'yes') {
    return `/system/return-logs/setup/${id}/meter-details`
  }

  return `/system/return-logs/setup/${id}/meter-provided`
}

module.exports = {
  go
}
