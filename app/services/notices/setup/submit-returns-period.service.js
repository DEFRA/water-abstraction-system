'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/returns-period` page
 * @module SubmitReturnsPeriodService
 */

const DetermineReturnsPeriodService = require('./determine-returns-period.service.js')
const ReturnsPeriodPresenter = require('../../../presenters/notices/setup/returns-period.presenter.js')
const ReturnsPeriodValidator = require('../../../validators/notices/setup/returns-periods.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Formats data for the `/notices/setup/returns-period` page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 *
 * @returns {object} An object containing where to redirect to if there are no errors else the page data for the view
 * including the validation error details
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (validationResult) {
    const formattedData = ReturnsPeriodPresenter.go(session)

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

  const { returnsPeriod, summer } = DetermineReturnsPeriodService.go(session.returnsPeriod)

  session.determinedReturnsPeriod = {
    ...returnsPeriod,
    summer
  }

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
