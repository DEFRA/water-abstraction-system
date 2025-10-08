'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/notice-type` page
 * @module NoticeTypePresenter
 */

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
    backLink: { href: _backLink(sessionId, checkPageVisited, journey), text: 'Back' },
    options: _options(noticeType, journey),
    pageTitle: 'Select the notice type'
  }
}

function _backLink(sessionId, checkPageVisited, journey) {
  if (journey === 'standard') {
    return `/system/notices`
  }

  if (checkPageVisited) {
    return `/system/notices/setup/${sessionId}/check-notice-type`
  }

  return `/system/notices/setup/${sessionId}/licence`
}

function _options(noticeType, journey) {
  if (journey === 'standard') {
    return [
      {
        checked: noticeType === 'invitations',
        value: 'invitations',
        text: 'Returns invitation'
      },
      {
        checked: noticeType === 'reminders',
        value: 'reminders',
        text: 'Returns reminder'
      }
    ]
  }

  return [
    {
      checked: noticeType === 'invitations',
      value: 'invitations',
      text: 'Standard returns invitation'
    },
    {
      checked: noticeType === 'returnForms',
      value: 'returnForms',
      text: 'Submit using a paper form invitation'
    }
  ]
}

module.exports = {
  go
}
