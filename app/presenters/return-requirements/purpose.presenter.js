'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/purpose` page
 * @module PurposePresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/purpose` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {Object} [purposesData] - The purposes for the licence
 * @param {Object} [payload] - The payload from the request
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, purposesData, payload = {}) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    licencePurposes: _licencePurposes(purposesData, payload)
  }

  return data
}

function _licencePurposes (purposesData, payload) {
  // NOTE: 'purposes' is the payload value that tells us whether the user selected any purposes
  // for the return requirement.
  // If it is not set then it is because the presenter has been called from 'PurposeService' and it's the first
  // load. Else it has been called by the 'SubmitPurposeService' and the user has not checked a purpose from the list.
  // Either way, we use it to tell us wether there is anything in the payload worth transforming.
  const purposes = payload.purposes

  if (!purposes) {
    return purposesData
  }

  return purposes
}

module.exports = {
  go
}
