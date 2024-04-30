'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/site-description` page
 * @module SiteDescriptionPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/site-description` page
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
    siteDescription: session.data.siteDescription ? session.data.siteDescription : null
  }

  return data
}

module.exports = {
  go
}
