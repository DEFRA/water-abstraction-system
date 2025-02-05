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
    backLink: `/system/return-logs/setup/${sessionId}/meter-provided`,
    pageTitle: 'Is it a single volume?',
    returnReference,
    sessionId,
    singleVolume: singleVolume ?? null,
    singleVolumeQuantity: singleVolumeQuantity ?? null,
    units: units === 'cubic-metres' ? 'cubic metres' : units
  }
}

module.exports = {
  go
}
