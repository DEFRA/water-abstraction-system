/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @module SubmitLicenceNumberService
 */

import FetchLicenceDal from '../../../dal/licence-monitoring-station/fetch-licence.dal.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import LicenceNumberPresenter from '../../../presenters/licence-monitoring-station/setup/licence-number.presenter.js'
import LicenceNumberValidator from '../../../validators/licence-monitoring-station/setup/licence-number.validator.js'

/**
 * Orchestrates validating the data for `/licence-monitoring-station/setup/{sessionId}/licence-number` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await FetchSessionDal(sessionId)

  const licence = payload.licenceRef ? await FetchLicenceDal(payload.licenceRef) : null

  const validationResult = await _validate(payload, licence)

  if (!validationResult) {
    // If the submitted licence ref is different to what we already have in the session then all the info on the
    // following pages (condition and abstraction period) is invalid, so we ensure the checkPageVisited flag is false
    // and save the new values to the session.
    if (payload.licenceRef !== session.licenceRef) {
      session.checkPageVisited = false
      await _save(session, payload, licence)
    }

    return {
      checkPageVisited: session.checkPageVisited
    }
  }

  const formattedData = _submittedSessionData(session, payload)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save(session, payload, licence) {
  session.licenceId = licence.id
  session.licenceRef = payload.licenceRef

  await session.$update()
}

function _submittedSessionData(session, payload) {
  session.licenceRef = payload['licenceRef'] ?? null

  return LicenceNumberPresenter.go(session)
}

async function _validate(payload, licence) {
  const validation = LicenceNumberValidator.go(payload, licence)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

export {
  go
}
export default {
  go
}
