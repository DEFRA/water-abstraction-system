'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/notice-type` page
 *
 * @module SubmitNoticeTypeService
 */

const NoticeTypePresenter = require('../../../presenters/notices/setup/notice-type.presenter.js')
const NoticeTypeValidator = require('../../../validators/notices/setup/notice-type.validator.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/notice-type` page
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

  const pageData = NoticeTypePresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, _payload) {
  return session.$update()
}

function _validate(payload) {
  const validation = NoticeTypeValidator.go(payload)

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
