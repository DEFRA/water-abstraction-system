/**
 * Orchestrates validating the data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @module SubmitNoticeTypeService
 */

import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import { formatValidationResult } from 'water-abstraction-engine/presenters/base.presenter.js'
import { NoticeJourney, NoticeType, NoticeTypes } from 'water-abstraction-engine/lib/static-lookups.lib.js'
import { flashNotification, generateNoticeReferenceCode } from 'water-abstraction-engine/lib/general.lib.js'

import NoticeTypePresenter from '../../../presenters/notices/setup/notice-type.presenter.js'
import NoticeTypeValidator from '../../../validators/notices/setup/notice-type.validator.js'
import featureFlagsConfig from '../../../config/feature-flags.config.js'

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
export default async function submitNoticeTypeService(sessionId, payload, yar, auth) {
  const session = await FetchSessionDal(sessionId)

  const validationResult = _validate(payload)

  if (!validationResult) {
    const noticeTypeChanged = payload.noticeType !== session.noticeType

    _notification(session, noticeTypeChanged, yar)

    await _save(session, payload, noticeTypeChanged)

    return _redirect(session, payload.noticeType)
  }

  const pageData = NoticeTypePresenter(session, auth)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...pageData
  }
}

function _notification(session, noticeTypeChanged, yar) {
  if (session.checkPageVisited && noticeTypeChanged) {
    flashNotification(yar, 'Updated', 'Notice type updated')
  }
}

/**
 * Determines where to redirect the user after submitting the notice type.
 *
 * If the notice type has changed, we always redirect to the next page in the journey, even if the user came from the
 * 'check-notice-type' page.
 *
 * This is because changing the notice type invalidates the subsequent choices, for example, in ad-hoc we need to
 * re-validate the selected licence against the new notice type.
 *
 * We don't check explicitly for notice type changes here because if it has changed, we reset the `checkPageVisited`
 * flag in the session to false in `_save()`.
 *
 * So, if `checkPageVisited` is true, it means the notice type was not changed and we can safely redirect to the
 * 'check-notice-type' page.
 *
 * @private
 */
function _redirect(session, noticeType) {
  const { checkPageVisited, journey } = session

  if (journey === NoticeJourney.STANDARD) {
    if (checkPageVisited) {
      return { redirectUrl: 'check-notice-type' }
    }

    if (noticeType === NoticeType.INVITATIONS && featureFlagsConfig.alternateReturnInvitationPeriods) {
      return { redirectUrl: 'invitation-period' }
    }

    return { redirectUrl: 'returns-period' }
  }

  if (checkPageVisited) {
    return { redirectUrl: 'check-notice-type' }
  }

  return { redirectUrl: 'licence' }
}

async function _save(session, payload, noticeTypeChanged) {
  const { name, prefix, subType, notificationType } = NoticeTypes[payload.noticeType]

  session.name = name
  session.noticeType = payload.noticeType
  session.notificationType = notificationType
  session.referenceCode = generateNoticeReferenceCode(prefix)
  session.subType = subType

  // Changing the notice type invalidates the current journey, so users need to complete it again
  if (noticeTypeChanged) {
    session.checkPageVisited = false
  }

  return session.$update()
}

function _validate(payload) {
  const validationResult = NoticeTypeValidator(payload)

  return formatValidationResult(validationResult)
}
