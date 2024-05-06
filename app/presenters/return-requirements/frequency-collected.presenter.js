'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/frequency-collected` page
 * @module FrequencyCollectedPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/frequency-collected` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {string} requirementIndex - The index of the requirement being added or changed
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, requirementIndex) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    backLink: _backLink(session, requirementIndex),
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    frequencyCollected: requirement?.frequencyCollected ? requirement.frequencyCollected : null,
    sessionId
  }
}

function _backLink (session, requirementIndex) {
  const { checkYourAnswersVisited, id } = session

  if (checkYourAnswersVisited) {
    return `/system/return-requirements/${id}/check-your-answers`
  }

  return `/system/return-requirements/${id}/site-description/${requirementIndex}`
}

module.exports = {
  go
}
