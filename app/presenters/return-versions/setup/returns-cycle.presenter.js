'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/returns-cycle` page
 * @module ReturnsCyclePresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/returns-cycle` page
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
    returnsCycle: requirement?.returnsCycle ? requirement.returnsCycle : null,
    sessionId
  }
}

function _backLink (session, requirementIndex) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-versions/setup/${id}/check`
  }

  return `/system/return-versions/setup/${id}/abstraction-period/${requirementIndex}`
}

module.exports = {
  go
}
