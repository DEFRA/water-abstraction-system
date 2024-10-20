'use strict'

/**
 * Formats data for the `/return-requirements/setup/{sessionId}/frequency-collected` page
 * @module FrequencyCollectedPresenter
 */

/**
 * Formats data for the `/return-requirements/setup/{sessionId}/frequency-collected` page
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
    frequencyCollected: requirement?.frequencyCollected ? requirement.frequencyCollected : null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    sessionId
  }
}

function _backLink (session, requirementIndex) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-requirements/${id}/check`
  }

  return `/system/return-requirements/${id}/site-description/${requirementIndex}`
}

module.exports = {
  go
}
