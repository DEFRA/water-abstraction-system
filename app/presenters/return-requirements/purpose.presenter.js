'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/purpose` page
 * @module PurposePresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/purpose` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {Object} [purposesData] - The purposes for the licence
 * @param {Object} [payload] - The payload from the request
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, purposesData, payload = {}) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    licencePurposes: purposesData,
    selectedPurposes: session.data.purposes ? session.data.purposes.join(',') : ''
  }

  return data
}

module.exports = {
  go
}
