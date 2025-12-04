'use strict'

/**
 * Orchestrates validating the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @module SubmitNoticeTypeService
 */

const NoticeTypePresenter = require('../../../presenters/notices/setup/notice-type.presenter.js')
const NoticeTypeValidator = require('../../../validators/notices/setup/notice-type.validator.js')
const SessionModel = require('../../../models/session.model.js')
const { flashNotification, generateNoticeReferenceCode } = require('../../../lib/general.lib.js')
const { NoticeJourney, NoticeType, NoticeTypes } = require('../../../lib/static-lookups.lib.js')
const { formatValidationResult } = require('../../../presenters/base.presenter.js')

/**
 * Orchestrates validating the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @param {string} sessionId - The UUID for setup returns notice session record
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} - The data formatted for the view template
 */
async function go(sessionId, payload, yar, auth) {
  const session = await SessionModel.query().findById(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    const hasBeenVisited = session.checkPageVisited

    if (session.checkPageVisited && payload.noticeType !== session.noticeType) {
      flashNotification(yar, 'Updated', 'Notice type updated')

      session.checkPageVisited = false
    }

    await _save(session, payload)

    return _redirect(payload.noticeType, session.checkPageVisited, session.journey, hasBeenVisited)
  }

  const pageData = NoticeTypePresenter.go(session, auth)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...pageData
  }
}

function _redirect(noticeType, checkPageVisited, journey, hasBeenVisited) {
  if (noticeType === NoticeType.PAPER_RETURN && !checkPageVisited) {
    return {
      redirectUrl: 'paper-return'
    }
  }

  if (journey === NoticeJourney.STANDARD && !hasBeenVisited) {
    return {
      redirectUrl: 'returns-period'
    }
  }

  return {
    redirectUrl: 'check-notice-type'
  }
}

async function _save(session, payload) {
  const { name, prefix, subType, notificationType } = NoticeTypes[payload.noticeType]

  session.name = name
  session.noticeType = payload.noticeType
  session.notificationType = notificationType
  session.referenceCode = generateNoticeReferenceCode(prefix)
  session.subType = subType

  return session.$update()
}

function _validate(payload) {
  const validationResult = NoticeTypeValidator.go(payload)

  return formatValidationResult(validationResult)
}

module.exports = {
  go
}
