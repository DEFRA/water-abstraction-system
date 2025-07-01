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
    continueButton: _continueButton(sessionId),
    pageTitle: 'Check the notice type',
    summaryList: _summaryList(licenceRef, noticeType, sessionId)
  }
}

function _continueButton(sessionId) {
  return { text: 'Continue to check recipients', href: `/system/notices/setup/${sessionId}/check` }
}

function _summaryList(licenceRef, noticeType, sessionId) {
  return [
    {
      key: {
        text: 'Licence number'
      },
      value: {
        text: licenceRef
      },
      actions: {
        items: [
          {
            href: `/system/notices/setup/${sessionId}/licence`,
            text: 'Change',
            visuallyHiddenText: 'licence number'
          }
        ]
      }
    },
    {
      key: {
        text: 'Returns notice type'
      },
      value: {
        text: NOTICE_TYPE_TEXT[noticeType]
      },
      actions: {
        items: [
          {
            href: `/system/notices/setup/${sessionId}/notice-type`,
            text: 'Change',
            visuallyHiddenText: 'notice type'
          }
        ]
      }
    }
  ]
}

module.exports = {
  go
}
