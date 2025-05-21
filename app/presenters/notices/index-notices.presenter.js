'use strict'

/**
 * Formats data for the `/notices` page
 * @module IndexNoticesPresenter
 */

const { formatLongDate, formatNumber, titleCase } = require('../base.presenter.js')

const NOTICE_MAPPINGS = {
  'hof-resume': 'HOF resume',
  'hof-stop': 'HOF stop',
  'hof-warning': 'HOF warning',
  paperReturnForms: 'Paper return',
  renewal: 'Renewal',
  returnInvitation: 'Returns invitation',
  returnReminder: 'Returns reminder',
  waterAbstractionAlerts: 'alert'
}

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
    const { createdAt, errorCount, id, issuer, referenceCode, recipientCount } = notice

    return {
      createdDate: formatLongDate(createdAt),
      link: `/notifications/report/${id}`,
      recipients: recipientCount,
      reference: referenceCode,
      sentBy: issuer,
      status: errorCount > 0 ? 'error' : 'sent',
      type: _type(notice)
    }
  })
}

function _type(notice) {
  const { alertType, subtype } = notice

  if (alertType) {
    return `${titleCase(alertType)} alert`
  }

  return NOTICE_MAPPINGS[subtype]
}

module.exports = {
  go
}
