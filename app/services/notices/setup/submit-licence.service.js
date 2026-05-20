'use strict'

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/licence` page
 * @module SubmitLicenceService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')
const LicencePresenter = require('../../../presenters/notices/setup/licence.presenter.js')
const SubmitReturnsLicenceService = require('./returns-notice/submit-returns-licence.service.js')
const { NoticeJourney, NoticeType } = require('../../../lib/static-lookups.lib.js')
const { flashNotification } = require('../../../lib/general.lib.js')

/**
 * Orchestrates validating the data for `/notices/setup/{sessionId}/licence` page
 *
 * It first checks if the licence user has entered a licenceRef. If they haven't entered a licenceRef we return an
 * error. If they have we check if it exists in the database. If it doesn't exist we return an the same error.
 * We then fetch all the due returns for the licence.
 * If there are no due returns then we return an error to the user informing them that there are no due returns the
 * licence.
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} payload - The submitted form data
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} An empty object if there are no errors else the page data for the licence page including
 * the validation error details
 */
async function go(sessionId, payload, yar) {
  const session = await FetchSessionDal.go(sessionId)

  const { additionalSessionData, validationResult } = await SubmitReturnsLicenceService.go(session, payload)

  if (!validationResult) {
    const hasBeenVisited = session.checkPageVisited

    if (session.checkPageVisited && payload.licenceRef !== session.licenceRef) {
      flashNotification(yar, 'Updated', 'Licence number updated')

      session.checkPageVisited = false
    }

    await _save(session, payload, additionalSessionData)

    return _redirect(session.noticeType, session.checkPageVisited, session.journey, hasBeenVisited)
  }

  session.licenceRef = payload.licenceRef

  const pageData = LicencePresenter.go(session)

  return {
    activeNavBar: 'notices',
    error: validationResult,
    ...pageData
  }
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

module.exports = {
  go
}
