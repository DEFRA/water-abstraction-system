/**
 * Formats data for the `/notices/setup/{sessionId}/notice-type` page
 * @module NoticeTypePresenter
 */

import { NoticeJourney, NoticeType, NoticeTypes } from 'water-abstraction-engine/lib/static-lookups.lib.js'

/**
 * Formats data for the `/notices/setup/{sessionId}/notice-type` page
 *
 * @param {module:SessionModel} session - The session instance
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {object} - The data formatted for the view template
 */
export default function noticeTypePresenter(session, auth) {
  const { checkPageVisited, id: sessionId, noticeType, journey } = session

  return {
    backLink: _backLink(sessionId, checkPageVisited),
    noticeTypes: _noticeTypes(noticeType, journey, auth),
    pageTitle: 'Select the notice type'
  }
}

function _backLink(sessionId, checkPageVisited) {
  if (checkPageVisited) {
    return {
      href: `/system/notices/setup/${sessionId}/check-notice-type`,
      text: 'Back'
    }
  }

  return {
    href: '/system/notices',
    text: 'Back'
  }
}

/**
 * These are for both adhoc and the standard journey.
 *
 * The standard journey will only show 'invitations' and 'reminders'.
 *
 * The adhoc journey can show 'invitations', 'reminders' and 'paper return' (depending on scope / permissions).
 *
 * @private
 */
function _noticeTypes(noticeType, journey, auth) {
  const {
    credentials: { scope }
  } = auth

  const items = []

  if (journey === NoticeJourney.ADHOC) {
    if (scope.includes('bulk_return_notifications')) {
      items.push({
        checked: noticeType === NoticeType.PAPER_RETURN,
        value: NoticeType.PAPER_RETURN,
        text: 'Paper return'
      })
    }

    if (scope.includes('renewal_notifications')) {
      items.push({
        checked: noticeType === NoticeType.RENEWAL_INVITATIONS,
        value: NoticeType.RENEWAL_INVITATIONS,
        text: NoticeTypes[NoticeType.RENEWAL_INVITATIONS].notificationType
      })
    }
  }

  if (scope.includes('bulk_return_notifications')) {
    items.push(
      {
        checked: noticeType === NoticeType.INVITATIONS,
        value: NoticeType.INVITATIONS,
        text: NoticeTypes[NoticeType.INVITATIONS].notificationType
      },
      {
        checked: noticeType === NoticeType.REMINDERS,
        value: NoticeType.REMINDERS,
        text: NoticeTypes[NoticeType.REMINDERS].notificationType
      }
    )
  }

  return items
}
