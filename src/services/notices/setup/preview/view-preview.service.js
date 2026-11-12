/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 * @module ViewPreviewService
 */

import AbstractionAlertNotificationsPresenter from 'water-abstraction-engine/presenters/notices/setup/abstraction-alert-notifications.presenter.js'
import FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import ReturnsNotificationsPresenter from 'water-abstraction-engine/presenters/notices/setup/returns-notifications.presenter.js'
import { NoticeType } from 'water-abstraction-engine/lib/static-lookups.lib.js'

import FetchRecipientsService from '../fetch-recipients.service.js'
import PreviewPresenter from '../../../../presenters/notices/setup/preview/preview.presenter.js'
import RenewalNotificationsPresenter from '../../../../presenters/notices/setup/renewal-notifications.presenter.js'

/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 *
 * @param {string} sessionId - The UUID of the returns notices session record
 * @param {string} contactHashId - The recipient's unique identifier
 * @param {string} [licenceMonitoringStationId=null] - The UUID of the licence monitoring station record (This is only
 * populated for abstraction alerts)
 *
 * @returns {Promise<object>} The view data for the preview page
 */
export default async function viewPreviewService(sessionId, contactHashId, licenceMonitoringStationId = null) {
  const session = await FetchSessionDal(sessionId)

  const recipient = await _recipient(contactHashId, session)
  const notification = _notification(recipient, session, licenceMonitoringStationId)

  const formattedData = await PreviewPresenter(
    contactHashId,
    session.noticeType,
    notification,
    sessionId,
    licenceMonitoringStationId,
    session.referenceCode
  )

  return {
    activeNavBar: 'notices',
    ...formattedData
  }
}

function _notification(recipient, session, licenceMonitoringStationId) {
  const renewalNoticeTypes = new Set([
    NoticeType.RENEWAL_FINALS,
    NoticeType.RENEWAL_INVITATIONS,
    NoticeType.RENEWAL_REMINDERS
  ])

  let notification

  if (session.noticeType === NoticeType.ABSTRACTION_ALERTS) {
    const unfilteredNotifications = AbstractionAlertNotificationsPresenter(session, [recipient], null)

    notification = unfilteredNotifications.find((unfilteredNotification) => {
      return unfilteredNotification.personalisation.licenceGaugingStationId === licenceMonitoringStationId
    })
  } else if (renewalNoticeTypes.has(session.noticeType)) {
    notification = RenewalNotificationsPresenter(session, [recipient], null)[0]
  } else {
    notification = ReturnsNotificationsPresenter(session, [recipient], null)[0]
  }

  return notification
}

async function _recipient(contactHashId, session) {
  const recipients = await FetchRecipientsService(session)

  return recipients.find((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })
}
