'use strict'

/**
 * Formats data for the `/notices` page
 * @module IndexNoticesPresenter
 */

const { formatLongDate, formatNumber, titleCase } = require('../base.presenter.js')

/**
 * Formats data for the `/notices` page
 *
 * @param {module:NoticeModel[]} notices - An array of notices to display
 * @param {number} numberOfNotices - The total number of notices
 *
 * @returns {object} - The data formatted for the view template
 */
function go(notices, numberOfNotices) {
  return {
    notices: _noticeRowData(notices),
    numberOfNoticesDisplayed: notices.length,
    totalNumberOfNotices: formatNumber(numberOfNotices)
  }
}

function _noticeRowData(notices) {
  return notices.map((notice) => {
    const { createdAt, errorCount, id, issuer, recipientCount } = notice

    return {
      createdDate: formatLongDate(createdAt),
      link: `/notifications/report/${id}`,
      recipients: recipientCount,
      sentBy: issuer,
      status: errorCount > 0 ? 'error' : 'sent',
      type: _type(notice)
    }
  })
}

function _type(notice) {
  const { alertType, name } = notice

  const prefix = alertType ? `${titleCase(alertType)} - ` : ''

  return `${prefix}${name}`
}

module.exports = {
  go
}
