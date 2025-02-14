'use strict'

/**
 * Orchestrates validating the data for `/notifications/setup/returns-period` page
 * @module SubmitReturnsPeriodService
 */

const NotificationsPresenter = require('../../../presenters/notifications/setup/returns-period.presenter.js')
const ReturnsPeriodValidator = require('../../../validators/notifications/setup/returns-periods.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Formats data for the `/notifications/setup/returns-period` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload
 * @returns {object} The view data for the returns period page, inc error/redirect when applicable
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (validationResult) {
    const formattedData = NotificationsPresenter.go(session)

    return {
      activeNavBar: 'manage',
      error: validationResult,
      pageTitle: 'Select the returns periods for the invitations',
      ...formattedData
    }
  }

  await _save(session, payload)

  return {
    redirect: `${sessionId}/check`
  }
}

async function _save(session, payload) {
  session.returnsPeriod = payload.returnsPeriod

  return session.$update()
}

function _validate(payload) {
  const validation = ReturnsPeriodValidator.go(payload)

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
