/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 * @module CheckNoticeTypePresenter
 */

import { NoticeType, NoticeTypes } from '../../../lib/static-lookups.lib.js'
import { formatLongDate } from '../../base.presenter.js'
import { returnsPeriodText } from '../base.presenter.js'

const NOTICE_TYPE_TEXT = {
  [NoticeType.INVITATIONS]: NoticeTypes[NoticeType.INVITATIONS].notificationType,
  [NoticeType.PAPER_RETURN]: 'Paper return',
  [NoticeType.REMINDERS]: NoticeTypes[NoticeType.REMINDERS].notificationType,
  [NoticeType.RENEWAL_INVITATIONS]: NoticeTypes[NoticeType.RENEWAL_INVITATIONS].notificationType
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
    licenceRef,
    noticeType,
    selectedReturns = []
  } = session

  return {
    links: _links(sessionId),
    pageTitle: 'Check the notice type',
    noticeType: NOTICE_TYPE_TEXT[noticeType],
    sessionId,
    ..._returns(selectedReturns, dueReturns, noticeType),
    ..._licence(licenceRef),
    ..._returnsPeriod(determinedReturnsPeriod)
  }
}

function _licence(licenceRef) {
  return licenceRef ? { licenceRef } : {}
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
  return noticeType === NoticeType.PAPER_RETURN ? { returns: _selectedDueReturns(selectedReturns, dueReturns) } : {}
}

function _returnsPeriod(determinedReturnsPeriod) {
  return determinedReturnsPeriod ? { returnsPeriodText: returnsPeriodText(determinedReturnsPeriod) } : {}
}

function _selectedDueReturns(selectedReturns, dueReturns) {
  const selectedDueReturns = dueReturns.filter((dueReturn) => {
    return selectedReturns.includes(dueReturn.returnLogId)
  })

  return selectedDueReturns.map((returnItem) => {
    return `${returnItem.returnReference} - ${formatLongDate(new Date(returnItem.startDate))} to ${formatLongDate(new Date(returnItem.endDate))}`
  })
}

export default {
  go
}
