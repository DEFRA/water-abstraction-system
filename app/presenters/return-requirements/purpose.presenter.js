'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/purpose` page
 * @module PurposePresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/purpose` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {module:PurposeModel[]} purposesData - The purposes for the licence
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, requirementIndex, purposesData) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    backLink: _backLink(session),
    licenceId: licence.id,
    licencePurposes: _licencePurposes(purposesData),
    licenceRef: licence.licenceRef,
    purposes: requirement?.purposes ? requirement.purposes.join(',') : '',
    sessionId
  }
}

function _backLink (session) {
  const { checkPageVisited, id } = session

  if (checkPageVisited) {
    return `/system/return-requirements/${id}/check`
  }

  return `/system/return-requirements/${id}/setup`
}

function _licencePurposes (purposesData) {
  return purposesData.map((purpose) => {
    return purpose.description
  })
}

module.exports = {
  go
}
