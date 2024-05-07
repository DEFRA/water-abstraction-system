'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/agreements-exceptions` page
 * @module AgreementsExceptionsPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/agreements-exceptions` page
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
    agreementsExceptions: requirement?.agreementsExceptions ? requirement.agreementsExceptions : null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    sessionId
  }
}

function _backLink (session, requirementIndex) {
  const { checkYourAnswersVisited, id } = session

  if (checkYourAnswersVisited) {
    return `/system/return-requirements/${id}/check-your-answers`
  }

  return `/system/return-requirements/${id}/frequency-reported/${requirementIndex}`
}

module.exports = {
  go
}
