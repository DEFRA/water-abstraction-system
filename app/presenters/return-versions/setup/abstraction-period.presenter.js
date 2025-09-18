'use strict'

/**
 * Formats data for the `/return-versions/setup/{sessionId}/abstraction-period` page
 * @module AbstractionPeriodPresenter
 */

/**
 * Formats data for the `/return-versions/setup/{sessionId}/abstraction-period` page
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
    abstractionPeriod: requirement?.abstractionPeriod ? requirement.abstractionPeriod : null,
    backLink: _backLink(session, requirementIndex),
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    pageTitle: 'Enter the abstraction period for the requirements for returns',
    pageTitleCaption: `Licence ${licence.licenceRef}`,
    sessionId
  }
}

function _backLink(session, requirementIndex) {
  const { checkPageVisited, id } = session
  let backLink

  if (checkPageVisited) {
    backLink = `/system/return-versions/setup/${id}/check`
  } else {
    backLink = `/system/return-versions/setup/${id}/points/${requirementIndex}`
  }

  return {
    href: backLink,
    text: 'Back'
  }
}

module.exports = {
  go
}
