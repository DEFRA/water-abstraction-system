'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/returns-cycle` page
 * @module ReturnsCyclePresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/returns-cycle` page
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
    returnsCycle: session.data.returnsCycle ? session.data.returnsCycle : null
  }

  return data
}

module.exports = {
  go
}
