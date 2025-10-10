'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/notice-type` page
 * @module NoticeTypePresenter
 */

const { NoticeType, NoticeJourney } = require('../../../lib/static-lookups.lib.js')

/**
 * Formats data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session, auth) {
  const { checkPageVisited, id: sessionId, noticeType, journey } = session

  return {
    backLink: _backLink(sessionId, checkPageVisited, journey),
    options: _options(noticeType, journey, auth),
    pageTitle: 'Select the notice type'
  }
}

function _backLink(sessionId, checkPageVisited, journey) {
  if (journey === NoticeJourney.STANDARD) {
    return {
      href: `/system/notices`,
      text: 'Back'
    }
  }

  if (checkPageVisited) {
    return {
      href: `/system/notices/setup/${sessionId}/check-notice-type`,
      text: 'Back'
    }
  }

  return {
    href: `/system/notices/setup/${sessionId}/licence`,
    text: 'Back'
  }
}

/**
 * These options are for both adhoc and the standard journey.
 *
 * The standard journey will only show the 'invitations' and 'reminders' options.
 *
 * The adhoc journey can show the 'invitations', 'reminders' and 'paper return' options (depending on scope / permissions).
 *
 * @private
 */
function _options(noticeType, journey, auth) {
  const {
    credentials: { scope }
  } = auth

  let options = []

  if (scope.includes('bulk_return_notifications')) {
    options = [
      {
        checked: noticeType === NoticeType.INVITATIONS,
        value: NoticeType.INVITATIONS,
        text: 'Returns invitation'
      },
      {
        checked: noticeType === NoticeType.REMINDERS,
        value: NoticeType.REMINDERS,
        text: 'Returns reminder'
      }
    ]
  }

  if (journey !== NoticeJourney.STANDARD) {
    options = [
      ...options,
      {
        checked: noticeType === NoticeType.PAPER_RETURN,
        value: NoticeType.PAPER_RETURN,
        text: 'Paper return'
      }
    ]
  }

  return options
}

module.exports = {
  go
}
