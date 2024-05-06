'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/frequency-reported` page
 * @module FrequencyReportedPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/frequency-reported` page
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
    frequencyReported: session.frequencyReported ? session.frequencyReported : null
  }

  return data
}

module.exports = {
  go
}
