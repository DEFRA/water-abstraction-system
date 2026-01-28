'use strict'

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @module SubmitAbstractionAlertsService
 */

const AbstractionAlertsPresenter = require('../../../presenters/company-contacts/setup/abstraction-alerts.presenter.js')
const AbstractionAlertsValidator = require('../../../validators/company-contacts/setup/abstraction-alerts.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the '/company-contacts/setup/{sessionId}/abstraction-alerts' page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const pageData = AbstractionAlertsPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validationResult = AbstractionAlertsValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
