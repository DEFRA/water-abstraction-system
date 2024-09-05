'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/additional-submission-options` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go (session) {
  const { id: sessionId, licence: { id: licenceId, licenceRef }, additionalSubmissionOptions } = session
  const data = {
    additionalSubmissionOptions: additionalSubmissionOptions ?? [],
    backLink: `/system/return-requirements/${sessionId}/check`,
    licenceId,
    licenceRef,
    sessionId
  }

  return data
}

module.exports = {
  go
}
