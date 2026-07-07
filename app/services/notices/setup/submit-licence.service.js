/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/licence` page
 * @module SubmitLicenceService
 */

import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import LicencePresenter from '../../../presenters/notices/setup/licence.presenter.js'
import ProcessRenewalsNoticeLicenceSubmission from './renewal-notice/process-licence-submission.service.js'
import ProcessReturnsNoticeLicenceSubmission from './returns-notice/process-licence-submission.service.js'
import { flashNotification } from '../../../lib/general.lib.js'
import { NoticeJourney, NoticeType } from '../../../lib/static-lookups.lib.js'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/licence` page
 *
 * Delegates to the notice-type-specific service to validate the payload and fetch any additional session data.
 * If valid, saves the result to the session and determines where to redirect the user. If invalid, returns the page
 * data with the error details so the page can be re-rendered.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} An object with a `redirectUrl` property if there are no validation errors, else an object
 * with the presenter data and an `error` property
 */
async function go(sessionId, payload, yar) {
  const session = await FetchSessionDal.go(sessionId)

  const { additionalSessionData, validationResult } = await _processedLicenceSubmission(session.noticeType, payload)

  if (!validationResult) {
    const checkPageVisited = session.checkPageVisited
    const licenceChanged = checkPageVisited && payload.licenceRef !== session.licenceRef

    if (licenceChanged) {
      flashNotification(yar, 'Updated', 'Licence number updated')

      session.checkPageVisited = false
    }

    await _save(session, payload, additionalSessionData)

    return _redirect(session.noticeType, session.journey, checkPageVisited, licenceChanged)
  }

  session.licenceRef = payload.licenceRef

  const pageData = LicencePresenter.go(session)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...pageData
  }
}

async function _processedLicenceSubmission(noticeType, payload) {
  if (noticeType === NoticeType.RENEWAL_INVITATIONS) {
    return ProcessRenewalsNoticeLicenceSubmission.go(payload)
  }

  return ProcessReturnsNoticeLicenceSubmission.go(payload)
}

/**
 * The 'additionalSessionData' is an extra property returned by the notice-type-specific submitted service to merge
 * into the session alongside the existing session
 *
 * @private
 */
async function _save(session, payload, additionalSessionData) {
  session.licenceRef = payload.licenceRef

  Object.assign(session, additionalSessionData)

  return session.$update()
}

function _redirect(noticeType, journey, checkPageVisited, licenceChanged) {
  if (noticeType === NoticeType.PAPER_RETURN) {
    if (!checkPageVisited || licenceChanged) {
      return {
        redirectUrl: 'paper-return'
      }
    }
  }

  if (journey === NoticeJourney.STANDARD && !checkPageVisited) {
    return {
      redirectUrl: 'returns-period'
    }
  }

  return {
    redirectUrl: 'check-notice-type'
  }
}

export {
  go
}
export default {
  go
}
