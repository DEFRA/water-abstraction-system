'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/cancel-requirements` page
 * @module CancelRequirementsPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/cancel-requirements` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {Object} [payload] - The payload from the request
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, payload = {}) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef
  }

  return data
}

module.exports = {
  go
}
