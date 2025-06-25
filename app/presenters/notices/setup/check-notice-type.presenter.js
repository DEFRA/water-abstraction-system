'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 * @module CheckNoticeTypePresenter
 */

const NOTICE_TYPE_TEXT = {
  invitations: 'Standard returns invitation',
  'paper-forms': 'Submit using a paper form invitation'
}

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const { licenceRef, noticeType, id: sessionId } = session

  return {
    backLink: `/system/notices/setup/${sessionId}/notice-type`,
    continueButton: _continueButton(sessionId),
    pageTitle: 'Check the notice type',
    summaryList: _summaryList(licenceRef, noticeType)
  }
}

function _continueButton(sessionId) {
  return { text: 'Continue to check recipients', href: `/system/notices/setup/${sessionId}/check` }
}

function _summaryList(licenceRef, noticeType) {
  return [
    {
      key: {
        text: 'Licence number'
      },
      value: {
        text: licenceRef
      }
    },
    {
      key: {
        text: 'Returns notice type'
      },
      value: {
        text: NOTICE_TYPE_TEXT[noticeType]
      }
    }
  ]
}

module.exports = {
  go
}
