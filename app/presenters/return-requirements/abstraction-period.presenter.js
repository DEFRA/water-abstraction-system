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
    abstractionPeriod: session.data.abstractionPeriod ? session.data.abstractionPeriod : null,
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef
  }

  return data
}

module.exports = {
  go
}
