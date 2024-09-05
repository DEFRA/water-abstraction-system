'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/site-description` page
 * @module SiteDescriptionPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/site-description` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {object} - The data formatted for the view template
 */
function go (session, requirementIndex) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    backLink: _backLink(session, requirementIndex),
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    sessionId,
    siteDescription: requirement?.siteDescription ? requirement.siteDescription : null
  }
}

function _backLink (session, requirementIndex) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-requirements/${id}/check`
  }

  return `/system/return-requirements/${id}/returns-cycle/${requirementIndex}`
}

module.exports = {
  go
}
