'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/additional-submission-options` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go (session) {
  const {
    id: sessionId, licence: { id: licenceId, licenceRef },
    additionalSubmissionOptions, quarterlyReturnSubmissions
  } = session

  return {
    additionalSubmissionOptions: additionalSubmissionOptions ?? [],
    backLink: `/system/return-versions/setup/${sessionId}/check`,
    licenceId,
    licenceRef,
    quarterlyReturnSubmissions,
    sessionId
  }
}

module.exports = {
  go
}
