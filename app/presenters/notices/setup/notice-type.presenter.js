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
  const { noticeType, id: sessionId } = session

  return {
    backLink: `/system/notices/setup/${sessionId}/licence`,
    options: _options(noticeType),
    pageTitle: 'Select the notice type'
  }
}

function _options(noticeType) {
  return [
    {
      checked: noticeType === 'invitations',
      value: 'invitations',
      text: 'Standard returns invitation'
    },
    {
      checked: noticeType === 'paper-invitation',
      value: 'paper-invitation',
      text: 'Submit using a paper form invitation'
    }
  ]
}

module.exports = {
  go
}
