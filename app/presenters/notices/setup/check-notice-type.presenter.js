'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 * @module CheckNoticeTypePresenter
 */

const { NoticeType } = require('../../../lib/static-lookups.lib.js')
const { formatLongDate } = require('../../base.presenter.js')
const { returnsPeriodText } = require('../base.presenter.js')

const NOTICE_TYPE_TEXT = {
  [NoticeType.INVITATIONS]: 'Returns invitation',
  [NoticeType.REMINDERS]: 'Returns reminder',
  [NoticeType.PAPER_RETURN]: 'Paper return'
}

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {object} - The data formatted for the view template
 */
function go(session) {
  const {
    determinedReturnsPeriod = null,
    dueReturns = [],
    id: sessionId,
    licenceRef = null,
    noticeType,
    selectedReturns = []
  } = session

  return {
    links: _links(sessionId),
    pageTitle: 'Check the notice type',
    returnNoticeType: NOTICE_TYPE_TEXT[noticeType],
    sessionId,
    ..._returns(selectedReturns, dueReturns, noticeType),
    ..._licence(licenceRef),
    ..._returnsPeriod(determinedReturnsPeriod)
  }
}

function _licence(licenceRef) {
  if (licenceRef) {
    return {
      licenceRef
    }
  }
}

function _links(sessionId) {
  return {
    licenceNumber: `/system/notices/setup/${sessionId}/licence`,
    returnsPeriod: `/system/notices/setup/${sessionId}/returns-period`,
    noticeType: `/system/notices/setup/${sessionId}/notice-type`,
    returns: `/system/notices/setup/${sessionId}/paper-return`
  }
}

function _returns(selectedReturns, dueReturns, noticeType) {
  if (noticeType === NoticeType.PAPER_RETURN) {
    return {
      returns: _selectedDueReturns(selectedReturns, dueReturns)
    }
  }
}

function _returnsPeriod(determinedReturnsPeriod) {
  if (determinedReturnsPeriod) {
    return {
      returnsPeriodText: returnsPeriodText(determinedReturnsPeriod)
    }
  }
}

function _selectedDueReturns(selectedReturns, dueReturns) {
  const selectedDueReturns = dueReturns.filter((dueReturn) => {
    return selectedReturns.includes(dueReturn.returnId)
  })

  return selectedDueReturns.map((returnItem) => {
    return `${returnItem.returnReference} - ${formatLongDate(new Date(returnItem.startDate))} to ${formatLongDate(new Date(returnItem.endDate))}`
  })
}

module.exports = {
  go
}
