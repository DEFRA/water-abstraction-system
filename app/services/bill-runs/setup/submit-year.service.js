'use strict'

/**
 * Handles the user submission for the `/bill-runs/setup/{sessionId}/year` page
 * @module SubmitYearService
 */

const SessionModel = require('../../../models/session.model.js')
const YearPresenter = require('../../../presenters/bill-runs/setup/year.presenter.js')
const YearValidator = require('../../../validators/bill-runs/setup/year.validator.js')

/**
 * Handles the user submission for the `/bill-runs/setup/{sessionId}/year` page
 *
 * It first retrieves the session instance for the setup bill run journey in progress. It then validates the payload of
 * the submitted request.
 *
 * If there is no validation error it will save the selected value to the session then return an object with a
 * `setupComplete:` property. If the year is not PRESROC this will be true. Else it will be false. The fact the property
 * exists will tell the controller the submission was successful. Whether the property `setupComplete:` is true or false
 * will be used to determine which page to direct the user to next.
 *
 * If there is a validation error it is combined with the output of the presenter to generate the page data needed to
 * re-render the view with an error message.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {Object} payload - The submitted form data
 *
 * @returns {Promise<Object>} An object with a `setupComplete:` property if there are no errors else the page data for
 * the year page including the validation error details
 */
async function go (sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return { setupComplete: ['2024', '2023'].includes(session.year) }
  }

  const formattedData = YearPresenter.go(session)

  return {
    error: validationResult,
    ...formattedData
  }
}

async function _save (session, payload) {
  session.year = payload.year

  return session.$update()
}

function _validate (payload, regions) {
  const validation = YearValidator.go(payload, regions)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
