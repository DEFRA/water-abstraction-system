'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/abstraction-period` page
 * @module AbstractionPeriodPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/abstraction-period` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session) {
  const data = {
    abstractionPeriod: session.abstractionPeriod ? session.abstractionPeriod : null,
    id: session.id,
    licenceId: session.licence.id,
    licenceRef: session.licence.licenceRef
  }

  return data
}

module.exports = {
  go
}
