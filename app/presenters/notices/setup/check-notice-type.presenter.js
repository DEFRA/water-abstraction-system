'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 * @module CheckNoticeTypePresenter
 */

const { NoticeType } = require('../../../lib/static-lookups.lib.js')
const { formatLongDate } = require('../../base.presenter.js')

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
  const { dueReturns = [], id: sessionId, licenceRef, noticeType, selectedReturns = [] } = session

  return {
    licenceRef,
    links: _links(sessionId),
    pageTitle: 'Check the notice type',
    returnNoticeType: NOTICE_TYPE_TEXT[noticeType],
    selectedDueReturns: _selectedDueReturns(selectedReturns, dueReturns),
    sessionId,
    showReturns: noticeType === NoticeType.PAPER_RETURN
  }
}

function _links(sessionId) {
  return {
    licenceNumber: `/system/notices/setup/${sessionId}/licence`,
    noticeType: `/system/notices/setup/${sessionId}/notice-type`,
    returns: `/system/notices/setup/${sessionId}/paper-return`
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
