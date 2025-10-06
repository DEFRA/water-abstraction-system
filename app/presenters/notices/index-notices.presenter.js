'use strict'

/**
 * Formats data for the `/notices` page
 * @module IndexNoticesPresenter
 */

const { formatLongDate, titleCase } = require('../base.presenter.js')

const featureFlagsConfig = require('../../../config/feature-flags.config.js')

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
 * @param {number} totalNumber - The total number of notices
 * @param {number} selectedPage - The selected page of results
 * @param {number} numberOfPages - The number of pages of results to paginate
 *
 * @returns {object} - The data formatted for the view template
 */
function go(notices, totalNumber, selectedPage, numberOfPages) {
  return {
    notices: _noticeRowData(notices),
    pageTitle: _pageTitle(selectedPage, numberOfPages),
    tableCaption: _tableCaption(notices.length, totalNumber)
  }
}

function _link(noticeId) {
  if (featureFlagsConfig.enableSystemNoticeView) {
    return `/system/notices/${noticeId}`
  }

  return `/notifications/report/${noticeId}`
}

function _noticeRowData(notices) {
  return notices.map((notice) => {
    const { createdAt, id, issuer, overallStatus, referenceCode, recipientCount } = notice

    return {
      createdDate: formatLongDate(createdAt),
      link: _link(id),
      recipients: recipientCount,
      reference: referenceCode,
      sentBy: issuer,
      status: overallStatus,
      type: _type(notice)
    }
  })
}

function _pageTitle(selectedPage, numberOfPages) {
  if (numberOfPages < 2) {
    return 'Notices'
  }

  return `Notices (page ${selectedPage} of ${numberOfPages})`
}

function _tableCaption(numberDisplayed, totalNumber) {
  if (totalNumber > numberDisplayed) {
    return `Showing ${numberDisplayed} of ${totalNumber} notices`
  }

  return `Showing all ${totalNumber} notices`
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
