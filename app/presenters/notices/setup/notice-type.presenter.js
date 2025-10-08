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
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { checkPageVisited, id: sessionId, noticeType, journey } = session

  return {
    backLink: _backLink(sessionId, checkPageVisited, journey),
    options: _options(noticeType, journey),
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

function _options(noticeType, journey) {
  if (journey === NoticeJourney.STANDARD) {
    return [
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

  return [
    {
      checked: noticeType === NoticeType.INVITATIONS,
      value: NoticeType.INVITATIONS,
      text: 'Returns invitation'
    },
    {
      checked: noticeType === NoticeType.PAPER_RETURN,
      value: NoticeType.PAPER_RETURN,
      text: 'Paper return'
    }
  ]
}

module.exports = {
  go
}
