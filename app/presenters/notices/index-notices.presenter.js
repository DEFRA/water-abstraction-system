/**
 * Formats data for the `/notices` page
 * @module IndexNoticesPresenter
 */

import { formatLongDate, formatNoticeType } from '../base.presenter.js'

/**
 * Formats data for the `/notices` page
 *
 * @param {module:NoticeModel[]} notices - An array of notices to display
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} - The data formatted for the view template
 */
function go(notices, auth) {
  const {
    credentials: { scope }
  } = auth

  return {
    helperText: _helperText(scope),
    links: _links(scope),
    notices: _noticeRowData(notices),
    pageSubHeading: 'View a notice',
    pageTitle: 'Notices'
  }
}

function _helperText(scope) {
  if (scope.includes('bulk_return_notifications') && scope.includes('renewal_notifications')) {
    return 'Create a renewals invitation, returns invitation, reminder or paper return notice'
  }

  if (scope.includes('bulk_return_notifications')) {
    return 'Create a returns invitation, reminder or paper return notice'
  }

  if (scope.includes('renewal_notifications')) {
    return 'Create a renewals invitation'
  }

  return null
}

function _links(scope) {
  const links = {}

  if (scope.includes('bulk_return_notifications') || scope.includes('renewal_notifications')) {
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

export default {
  go
}
