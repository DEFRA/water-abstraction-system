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
 * @param {module:PurposeModel[]} licencePurposes - All the purposes for the licence
 *
 * @returns {object} - The data formatted for the view template
 */
function go (session, requirementIndex, licencePurposes) {
  const { id: sessionId, licence, requirements } = session
  const requirement = requirements[requirementIndex]

  return {
    backLink: _backLink(session),
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    purposes: _purposes(licencePurposes, requirement.purposes),
    sessionId
  }
}

function _backLink (session) {
  const { checkPageVisited, id, requirements } = session

  // NOTE: Purpose is the first page in the manual setup journey. So, when a user first comes through, we want to allow
  // them to go back to `/method`. Once they've got to the `/check` page they may return because they clicked the
  // 'Change' link for the purpose. When this happens, `checkPageVisited` will be true and 'Back' needs to take them
  // back there.
  //
  // But if they click 'Add requirement' on the `/check` page they'll also be directed here. When that happens
  // `checkPageVisited` will have been reset to false to allow the user to progress through the setup journey. In this
  // scenario 'Back' also needs to take them back to `/check`. Hence, the logic is different in this presenter when
  // compared with the other setup pages.
  if (checkPageVisited || requirements.length > 1) {
    return `/system/return-requirements/${id}/check`
  }

  return `/system/return-requirements/${id}/method`
}

function _purposes (licencePurposes, requirementPurposes) {
  return licencePurposes.map((licencePurpose) => {
    const matchedRequirementPurpose = requirementPurposes?.find((requirementPurpose) => {
      return requirementPurpose.id === licencePurpose.id
    })

    return {
      alias: matchedRequirementPurpose?.alias ? matchedRequirementPurpose.alias : '',
      checked: !!matchedRequirementPurpose,
      description: licencePurpose.description,
      id: licencePurpose.id
    }
  })
}

module.exports = {
  go
}
