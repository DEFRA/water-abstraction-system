'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 * @module CheckNoticeTypePresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

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
  const { dueReturns, selectedReturns = [], licenceRef, noticeType, id: sessionId } = session

  return {
    continueButton: _continueButton(sessionId),
    pageTitle: 'Check the notice type',
    summaryList: _summaryList(sessionId, licenceRef, noticeType, dueReturns, selectedReturns)
  }
}

function _returns(sessionId, selectedReturns, dueReturns) {
  const selectedDueReturns = dueReturns.filter((dueReturn) => {
    return selectedReturns.includes(dueReturn.returnId)
  })

  const selectedDueReturnsNewLineString = selectedDueReturns
    .map((returnItem) => {
      return `${returnItem.returnReference} - ${formatLongDate(new Date(returnItem.startDate))} to ${formatLongDate(new Date(returnItem.endDate))}`
    })
    .join('<br>')

  return {
    key: {
      text: 'Returns'
    },
    value: {
      html: selectedDueReturnsNewLineString
    },
    actions: {
      items: [
        {
          href: `/system/notices/setup/${sessionId}/returns-for-paper-forms`,
          text: 'Change',
          visuallyHiddenText: 'returns for paper forms'
        }
      ]
    }
  }
}

function _continueButton(sessionId) {
  return { text: 'Continue to check recipients', href: `/system/notices/setup/${sessionId}/check` }
}

function _licenceNumber(sessionId, licenceRef) {
  return {
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
  }
}

function _noticeType(sessionId, noticeType) {
  return {
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
}

function _summaryList(sessionId, licenceRef, noticeType, dueReturns, selectedReturns) {
  const summaryList = [_licenceNumber(sessionId, licenceRef), _noticeType(sessionId, noticeType)]

  if (noticeType === 'paper-forms') {
    summaryList.push(_returns(sessionId, selectedReturns, dueReturns))
  }

  return summaryList
}

module.exports = {
  go
}
