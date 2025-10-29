'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/frequency-reported` page
 * @module FrequencyReportedPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/frequency-reported` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, requirementIndex) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    backLink: { href: _backLinkHref(session, requirementIndex), text: 'Back' },
    frequencyReported: requirement?.frequencyReported ? requirement.frequencyReported : null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    pageTitle: 'Select how often readings or volumes are reported',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    sessionId
  }
}

function _backLinkHref(session, requirementIndex) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-versions/setup/${id}/check`
  }

  return `/system/return-versions/setup/${id}/frequency-collected/${requirementIndex}`
}

module.exports = {
  go
}
