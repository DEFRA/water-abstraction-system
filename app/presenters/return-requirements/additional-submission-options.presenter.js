'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/additional-submission-options` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {Object} [payload] - The payload from the request
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  const data = {
    id: session.id,
    licenceId: session.licence.id,
    licenceRef: session.licence.licenceRef,
    additionalSubmissionOptions: session.additionalSubmissionOptions || null
  }

  return data
}

module.exports = {
  go
}
