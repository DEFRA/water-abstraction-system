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
 * @param {string[]} licencePurposes - The purposes for the licence
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, requirementIndex, licencePurposes) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    backLink: `/system/return-requirements/${sessionId}/setup`,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    licencePurposes,
    selectedPurposes: requirement?.purposes ? requirement.purposes.join(',') : '',
    sessionId
  }
}

module.exports = {
  go
}
