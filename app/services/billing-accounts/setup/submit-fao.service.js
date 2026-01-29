'use strict'

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/fao` page
 *
 * @module SubmitFAOService
 */

const FAOPresenter = require('../../../presenters/billing-accounts/setup/fao.presenter.js')
const FAOValidator = require('../../../validators/billing-accounts/setup/fao.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for `/billing-accounts/setup/{sessionId}/fao` page
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

    return payload
  }

  const pageData = FAOPresenter.go(session)

  return {
    activeNavBar: 'search',
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  session.fao = payload.fao

  return session.$update()
}

function _validate(payload) {
  const validationResult = FAOValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
