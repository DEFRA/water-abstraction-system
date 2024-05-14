'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/additional-submission-options` page
 * @module AdditionalSubmissionOptionsPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/additional-submission-options` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {string} requirementIndex - The index of the requirement being added or changed
 * @param {Object} [payload] - The payload from the request
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, requirementIndex) {
  const { id, licence: { id: licenceId, licenceRef }, requirements } = session
  const requirement = requirements[requirementIndex]
  const data = {
    id,
    licenceId,
    licenceRef,
    additionalSubmissionOptions: requirement?.additionalSubmissionOptions
      ? requirement.additionalSubmissionOptions.join(',')
      : ''
  }

  return data
}

module.exports = {
  go
}
