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
  // NOTE: The following checks whether a user has inputted any values for the abstraction period for the returns
  // requirements. If the values have not been set, then it is because the presenter has been called from
  // 'AbstractionPeriodService' and it's the first load. Else it has been called by the 'SubmitAbstractionPeriod' and
  // the user has not inputted any values for the abstraction period. Either way, we use it to tell us wether there is
  // anything in the payload worth transforming.

  return {
    startDay: payload['start-abstraction-period-day'] ? payload['start-abstraction-period-day'] : null,
    startMonth: payload['start-abstraction-period-month'] ? payload['start-abstraction-period-month'] : null,
    endDay: payload['end-abstraction-period-day'] ? payload['end-abstraction-period-day'] : null,
    endMonth: payload['end-abstraction-period-month'] ? payload['end-abstraction-period-month'] : null
  }
}

module.exports = {
  go
}
