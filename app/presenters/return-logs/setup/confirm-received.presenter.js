'use strict'

/**
 * Format data for the `/return-log/setup/{sessionId}/confirm-received` page
 * @module ConfirmReceivedPresenter
 */

/**
 * Format data for the `/return-log/setup/{sessionId}/confirm-received` page
 *
 * @param {module:SessionModel} session - The return log setup session instance
 *
 * @returns {object} page data needed by the view template
 */
function go(session) {
  const { id: sessionId, licenceId, licenceRef, purposes, returnReference, siteDescription } = session

  return {
    backLink: `/system/licences/${licenceId}/returns`,
    licenceRef,
    pageTitle: `Return ${returnReference} received`,
    purpose: _formatPurposes(purposes),
    sessionId,
    siteDescription
  }
}

function _formatPurposes(purposes) {
  if (purposes.length === 1) {
    return {
      label: 'Purpose',
      value: purposes[0]
    }
  }

  return {
    label: 'Purposes',
    value: purposes.join(', ')
  }
}

module.exports = {
  go
}
