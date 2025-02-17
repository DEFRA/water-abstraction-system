'use strict'

/**
 * Handles the user submission for the `/return-logs/setup/{sessionId}/submission` page
 * @module SubmitSubmissionService
 */

const SessionModel = require('../../../models/session.model.js')
const SubmissionPresenter = require('../../../presenters/return-logs/setup/submission.presenter.js')
const SubmissionValidator = require('../../../validators/return-logs/setup/submission.validator.js')

/**
 * Handles the user submission for the `/return-logs/setup/{sessionId}/submission` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} An object with a `journey:` property if there are no errors else the page data for
 * the abstraction return page including the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)
  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    const redirect = await _redirect(payload.journey)

    return { redirect }
  }

  const formattedData = SubmissionPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...formattedData
  }
}

async function _redirect(journey) {
  if (journey === 'nil-return') {
    return 'check'
  }

  return 'reported'
}

async function _save(session, payload) {
  // We set `checkPageVisited` to false here as it is possible that the user recorded a nil return in error and then
  // selected "Change" from the "Check" page. This would have resulted in `checkPageVisited` being set to `true` which
  // would cause issues with the flow of the journey if details were subsequently entered.
  session.checkPageVisited = false
  session.journey = payload.journey

  return session.$update()
}

function _validate(payload) {
  const validation = SubmissionValidator.go(payload)

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
