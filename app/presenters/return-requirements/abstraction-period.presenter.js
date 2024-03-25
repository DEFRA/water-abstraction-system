'use strict'

/**
 * Formats data for the `/return-requirements/{sessionId}/abstraction-period` page
 * @module AbstractionPeriodPresenter
*/

/**
 * Formats data for the `/return-requirements/{sessionId}/abstraction-period` page
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
    abstractionPeriod: _licenceAbstractionPeriod(payload)
  }

  return data
}

function _licenceAbstractionPeriod (payload) {
  // NOTE: 'abstractionPeriod' is the payload value that tells us whether the user inputted an abstraction period
  // for the return requirement site.
  // If it is not set then it is because the presenter has been called from 'AbstractionPeriodService' and it's the first
  // load. Else it has been called by the 'SubmitAbstractionPeriod' and the user has not inputted an abstraction period.
  // Either way, we use it to tell us wether there is anything in the payload worth transforming.
  const abstractionPeriod = payload.abstractionPeriod

  if (!abstractionPeriod) {
    return null
  }

  return abstractionPeriod
}

module.exports = {
  go
}
