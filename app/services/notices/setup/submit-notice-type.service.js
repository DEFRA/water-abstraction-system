'use strict'

/**
 * Orchestrates validating the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @module SubmitNoticeTypeService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const NoticeTypePresenter = require('../../../presenters/notices/setup/notice-type.presenter.js')
const NoticeTypeValidator = require('../../../validators/notices/setup/notice-type.validator.js')
const { NoticeJourney, NoticeTypes } = require('../../../lib/static-lookups.lib.js')
const { flashNotification, generateNoticeReferenceCode } = require('../../../lib/general.lib.js')
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
  const session = await FetchSessionDal.go(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    const hasBeenVisited = session.checkPageVisited

    if (session.checkPageVisited && payload.noticeType !== session.noticeType) {
      flashNotification(yar, 'Updated', 'Notice type updated')

      session.checkPageVisited = false
    }

    await _save(session, payload)

    return _redirect(payload.noticeType, session.journey, hasBeenVisited)
  }

  const pageData = NoticeTypePresenter.go(session, auth)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...pageData
  }
}

function _redirect(noticeType, journey, hasBeenVisited) {
  if (journey === NoticeJourney.STANDARD && !hasBeenVisited) {
    return {
      redirectUrl: 'returns-period'
    }
  }

  if (hasBeenVisited) {
    return {
      redirectUrl: 'check-notice-type'
    }
  }

  return {
    redirectUrl: 'licence'
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
