'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/frequency-collected` page
 * @module FrequencyCollectedPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/frequency-collected` page
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
    backLink: _backLink(session, requirementIndex),
    frequencyCollected: requirement?.frequencyCollected ? requirement.frequencyCollected : null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    pageTitle: 'Select how often readings or volumes are collected',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    sessionId
  }
}

function _backLink(session, requirementIndex) {
  let backLink
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    backLink = `/system/return-versions/setup/${id}/check`
  } else {
    backLink = `/system/return-versions/setup/${id}/site-description/${requirementIndex}`
  }

  return {
    href: backLink,
    text: 'Back'
  }
}

module.exports = {
  go
}
