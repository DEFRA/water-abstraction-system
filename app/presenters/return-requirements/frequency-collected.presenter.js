'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/frequency-collected` page
 * @module FrequencyCollectedPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/frequency-collected` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {Object} [payload] - The payload from the request
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    frequencyCollected: session.data.frequencyCollected ? session.data.frequencyCollected : null
  }

  return data
}

module.exports = {
  go
}
