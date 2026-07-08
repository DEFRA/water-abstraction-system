/**
 * Orchestrates validating the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @module SubmitNoticeTypeService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import NoticeTypePresenter from '../../../presenters/notices/setup/notice-type.presenter.js'
import NoticeTypeValidator from '../../../validators/notices/setup/notice-type.validator.js'
import { NoticeJourney, NoticeTypes } from '../../../lib/static-lookups.lib.js'
import { flashNotification, generateNoticeReferenceCode } from '../../../lib/general.lib.js'
import { formatValidationResult } from '../../../presenters/base.presenter.js'

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
export default async function go(sessionId, payload, yar, auth) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    const hasBeenVisited = session.checkPageVisited
    const noticeTypeChanged = payload.noticeType !== session.noticeType

    if (hasBeenVisited && noticeTypeChanged) {
      flashNotification(yar, 'Updated', 'Notice type updated')

      session.checkPageVisited = false
    }

    await _save(session, payload)

    return _redirect(session.journey, hasBeenVisited, noticeTypeChanged)
  }

  const pageData = NoticeTypePresenter.go(session, auth)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...pageData
  }
}

/**
 * Determines where to redirect the user after submitting the notice type.
 *
 * If the notice type has changed, we always redirect to the licence page, even if the user came from the check page.
 * This is because the licence ref needs to be revalidated against the new notice type.
 *
 * @private
 */
function _redirect(journey, hasBeenVisited, noticeTypeChanged) {
  if (journey === NoticeJourney.STANDARD && !hasBeenVisited) {
    return {
      redirectUrl: 'returns-period'
    }
  }

  if (hasBeenVisited && !noticeTypeChanged) {
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
