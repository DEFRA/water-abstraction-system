'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/standard` page
 *
 * @module SubmitStandardService
 */

const StandardPresenter = require('../../../presenters/notices/setup/standard.presenter.js')
const StandardValidator = require('../../../validators/notices/setup/standard.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')
const DetermineNoticeTypeService = require('./determine-notice-type.service.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/standard` page
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

  const pageData = StandardPresenter.go(session)

  return {
    error: validationResult,
    ...pageData
  }
}

async function _save(session, payload) {
  const noticeTypeData = DetermineNoticeTypeService.go(payload.noticeType)

  Object.assign(session, {
    ...noticeTypeData,
    noticeType: payload.noticeType
  })

  return session.$update()
}

function _validate(payload) {
  const validationResult = StandardValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
