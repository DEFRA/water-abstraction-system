'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/site-description` page
 * @module SiteDescriptionPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/site-description` page.
 *
 * @param {module:SessionModel} session - The returns requirements session instance.
 * @param {Object} [payload] - The payload from the request.
 *
 * @returns {Object} - The data formatted for the view template.
 */
function go (session, payload = {}) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    licenceSiteDescription: _licenceSiteDescription(payload)
  }

  return data
}

function _licenceSiteDescription (payload) {
  // NOTE: 'siteDescription' is the payload value that tells us whether the user inputted a siteDescription
  // for the return requirement site.
  // If it is not set then it is because the presenter has been called from 'SiteDescriptionService' and it's the first
  // load. Else it has been called by the 'SubmitSiteDescriptionService' and the user has not inputted a site description.
  // Either way, we use it to tell us wether there is anything in the payload worth transforming.
  const siteDescription = payload.siteDescription

  if (!siteDescription) {
    return null
  }

  return siteDescription
}

module.exports = {
  go
}
