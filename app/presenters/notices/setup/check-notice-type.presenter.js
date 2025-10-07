'use strict'

/**
 * Formats data for the `/notices/setup/{sessionId}/check-notice-type` page
 * @module CheckNoticeTypePresenter
 */

const { formatLongDate } = require('../../base.presenter.js')

const NOTICE_TYPE_TEXT = {
  invitations: 'Standard returns invitation',
  paperReturn: 'Submit using a paper form invitation'
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
    noticeType,
    returnNoticeType: NOTICE_TYPE_TEXT[noticeType],
    pageTitle: 'Check the notice type',
    selectedDueReturns: _selectedDueReturns(selectedReturns, dueReturns),
    sessionId
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
