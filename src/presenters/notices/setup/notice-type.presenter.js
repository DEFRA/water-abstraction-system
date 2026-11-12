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
        text: 'Paper return',
        value: NoticeType.PAPER_RETURN
      })
    }

    if (scope.includes('renewal_notifications')) {
      items.push(
        {
          checked: noticeType === NoticeType.RENEWAL_FINALS,
          text: NoticeTypes[NoticeType.RENEWAL_FINALS].notificationType,
          value: NoticeType.RENEWAL_FINALS
        },
        {
          checked: noticeType === NoticeType.RENEWAL_INVITATIONS,
          text: NoticeTypes[NoticeType.RENEWAL_INVITATIONS].notificationType,
          value: NoticeType.RENEWAL_INVITATIONS
        },
        {
          checked: noticeType === NoticeType.RENEWAL_REMINDERS,
          text: NoticeTypes[NoticeType.RENEWAL_REMINDERS].notificationType,
          value: NoticeType.RENEWAL_REMINDERS
        }
      )
    }
  }

  if (scope.includes('bulk_return_notifications')) {
    items.push(
      {
        checked: noticeType === NoticeType.INVITATIONS,
        text: NoticeTypes[NoticeType.INVITATIONS].notificationType,
        value: NoticeType.INVITATIONS
      },
      {
        checked: noticeType === NoticeType.REMINDERS,
        text: NoticeTypes[NoticeType.REMINDERS].notificationType,
        value: NoticeType.REMINDERS
      }
    )
  }

  return items
}
