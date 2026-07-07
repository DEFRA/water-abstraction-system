/**
 * Orchestrates fetching and presenting the data needed for the notices setup preview page
 * @module ViewPreviewService
 */

import AbstractionAlertNotificationsPresenter from '../../../../presenters/notices/setup/abstraction-alert-notifications.presenter.js'
import FetchRecipientsService from '../fetch-recipients.service.js'
import FetchSessionDal from '../../../../dal/fetch-session.dal.js'
import PreviewPresenter from '../../../../presenters/notices/setup/preview/preview.presenter.js'
import RenewalInvitationNotificationsPresenter from '../../../../presenters/notices/setup/renewal-invitation-notice-notifications.presenter.js'
import ReturnsNoticeNotificationsPresenter from '../../../../presenters/notices/setup/returns-notice-notifications.presenter.js'
import { NoticeType } from '../../../../lib/static-lookups.lib.js'

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
async function go(sessionId, contactHashId, licenceMonitoringStationId = null) {
  const session = await FetchSessionDal.go(sessionId)

  const recipient = await _recipient(contactHashId, session)
  const notification = _notification(recipient, session, licenceMonitoringStationId)

  const formattedData = await PreviewPresenter.go(
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
  let notification

  if (session.noticeType === NoticeType.ABSTRACTION_ALERTS) {
    const unfilteredNotifications = AbstractionAlertNotificationsPresenter.go(session, [recipient], null)

    notification = unfilteredNotifications.find((unfilteredNotification) => {
      return unfilteredNotification.personalisation.licenceGaugingStationId === licenceMonitoringStationId
    })
  } else if (session.noticeType === NoticeType.RENEWAL_INVITATIONS) {
    notification = RenewalInvitationNotificationsPresenter.go(session, [recipient], null)[0]
  } else {
    notification = ReturnsNoticeNotificationsPresenter.go(session, [recipient], null)[0]
  }

  return notification
}

async function _recipient(contactHashId, session) {
  const recipients = await FetchRecipientsService.go(session)

  return recipients.find((recipient) => {
    return recipient.contact_hash_id === contactHashId
  })
}

export { go }
export default {
  go
}
