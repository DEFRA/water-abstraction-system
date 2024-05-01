'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/agreements-exceptions` page
 * @module AgreementsExceptionsPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/agreements-exceptions` page
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
    agreementsExceptions: session.data.agreementsExceptions ? session.data.agreementsExceptions : ''
  }

  return data
}

module.exports = {
  go
}
