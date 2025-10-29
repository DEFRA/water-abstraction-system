'use strict'

/**
 * Formats data for the `/notices` page
 * @module IndexNoticesPresenter
 */

const { formatLongDate, formatNoticeType } = require('../base.presenter.js')

const featureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Formats data for the `/notices` page
 *
 * @param {module:NoticeModel[]} notices - An array of notices to display
 * @param {number} totalNumber - The total number of notices
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} - The data formatted for the view template
 */
function go(notices, totalNumber, auth) {
  const {
    credentials: { scope }
  } = auth

  return {
    links: _links(scope),
    notices: _noticeRowData(notices),
    pageSubHeading: 'View a notice',
    pageTitle: 'Notices',
    tableCaption: _tableCaption(notices.length, totalNumber)
  }
}

function _links(scope) {
  const links = {}

  if (
    featureFlagsConfig.enableAdHocNotifications &&
    (scope.includes('returns') || scope.includes('bulk_return_notifications'))
  ) {
    links.adhoc = {
      text: 'Create an ad-hoc notice',
      href: '/system/notices/setup/adhoc'
    }
  }

  if (scope.includes('bulk_return_notifications')) {
    links.notice = {
      text: 'Create a standard notice',
      href: '/system/notices/setup/standard'
    }
  }

  return links
}

function _noticeRowData(notices) {
  return notices.map((notice) => {
    const { alertType, createdAt, id, issuer, overallStatus, referenceCode, recipientCount, subtype } = notice

    return {
      createdDate: formatLongDate(createdAt),
      link: `/system/notices/${id}`,
      recipients: recipientCount,
      reference: referenceCode,
      sentBy: issuer,
      status: overallStatus,
      type: formatNoticeType(subtype, alertType)
    }
  })
}

function _tableCaption(numberDisplayed, totalNumber) {
  if (totalNumber > numberDisplayed) {
    return `Showing ${numberDisplayed} of ${totalNumber} notices`
  }

  return `Showing all ${totalNumber} notices`
}

module.exports = {
  go
}
