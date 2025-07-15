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
  const { checkPageVisited, id: sessionId, noticeType } = session

  return {
    backLink: _backLink(sessionId, checkPageVisited),
    options: _options(noticeType),
    pageTitle: 'Select the notice type'
  }
}

function _backLink(sessionId, checkPageVisited) {
  if (checkPageVisited) {
    return `/system/notices/setup/${sessionId}/check-notice-type`
  }

  return `/system/notices/setup/${sessionId}/licence`
}

function _options(noticeType) {
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
