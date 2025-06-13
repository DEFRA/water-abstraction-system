'use strict'

/**
 * Orchestrates validating the data for `` page
 *
 * @module SubmitSelectNoticeTypeService
 */

const SelectNoticeTypePresenter = require('../../../../presenters/notices/setup/ad-hoc/select-notice-type.presenter.js')
const SelectNoticeTypeValidator = require('../../../../validators/notices/setup/ad-hoc/select-notice-type.validator.js')
const SessionModel = require('../../../../models/session.model.js')

/**
 * Orchestrates validating the data for `` page
 *
 * @param {string} sessionId
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    await _save(session, payload)

    return {}
  }

  const pageData = SelectNoticeTypePresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  return session.$update()
}

function _validate(payload) {
  const validation = SelectNoticeTypeValidator.go(payload)

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
