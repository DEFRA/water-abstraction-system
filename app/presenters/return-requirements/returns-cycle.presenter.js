'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/returns-cycle` page
 * @module ReturnsCyclePresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/returns-cycle` page
 *
 * @param {module:SessionModel} session - The returns requirements session instance
 * @param {Object} [payload] - The payload from the request
 *
 * @returns {Object} - The data formatted for the view template
 */
function go (session, payload = {}) {
  const data = {
    id: session.id,
    licenceId: session.data.licence.id,
    licenceRef: session.data.licence.licenceRef,
    returnsCycle: _licenceReturnsCycle(payload)
  }

  return data
}

function _licenceReturnsCycle (payload) {
  // NOTE: 'returnsCycle' is the payload value that tells us whether the user has selected a returns cycle
  // for the return requirement.
  // If it is not set then it is because the presenter has been called from 'ReturnsCycleService' and it's the first
  // load. Else it has been called by the 'SubmitReturnsCycleService' and the user has not selected a returns cycle.
  // Either way, we use it to tell us wether there is anything in the payload worth transforming.
  const returnsCycle = payload.returnsCycle

  if (!returnsCycle) {
    return null
  }

  return returnsCycle
}

module.exports = {
  go
}
