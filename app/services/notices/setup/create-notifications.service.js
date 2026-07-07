/**
 * Create the notifications for a new notice based on the notice setup data and then return them
 * @module CreateNotificationsService
 */

import AbstractionAlertNotificationsPresenter from '../../../presenters/notices/setup/abstraction-alert-notifications.presenter.js'
import NotificationModel from '../../../../app/models/notification.model.js'
import PaperReturnNotificationsPresenter from '../../../presenters/notices/setup/paper-return-notifications.presenter.js'
import ReturnsInvitationNotificationsPresenter from '../../../presenters/notices/setup/renewal-invitation-notice-notifications.presenter.js'
import ReturnsNoticeNotificationsPresenter from '../../../presenters/notices/setup/returns-notice-notifications.presenter.js'

import { timestampForPostgres } from '../../../lib/general.lib.js'
import { NoticeType } from '../../../lib/static-lookups.lib.js'

/**
 * Create notifications
 *
 * This query uses postgresql's ability to insert with batches. There is a limitation on the batch size
 * https://www.postgresql.org/docs/current/postgres-fdw.html#POSTGRES-FDW-OPTIONS-REMOTE-EXECUTION.
 *
 * @param {SessionModel} session - The session instance
 * @param {object[]} recipients - List of recipients, each containing details like email or address of the recipient
 * @param {string} noticeId - The UUID of the notice these notifications should be linked to
 *
 * @returns {Promise<object>} - the created notifications
 */
async function go(session, recipients, noticeId) {
  const notifications = _notifications(session, recipients, noticeId)
  const persistedNotifications = []
  const timestamp = timestampForPostgres()

  for (const notification of notifications) {
    const persistedNotification = await NotificationModel.query()
      .insert({
        ...notification,
        createdAt: timestamp,
        updatedAt: timestamp
      })
      .returning([
        'contactType',
        'createdAt',
        'dueDate',
        'id',
        'licenceMonitoringStationId',
        'messageRef',
        'messageType',
        'pdf',
        'personalisation',
        'recipient',
        'returnLogIds',
        'templateId'
      ])

    persistedNotifications.push(persistedNotification)
  }

  return persistedNotifications
}

function _notifications(session, recipients, noticeId) {
  const { noticeType } = session

  if (noticeType === NoticeType.ABSTRACTION_ALERTS) {
    return AbstractionAlertNotificationsPresenter.go(session, recipients, noticeId)
  }

  if (noticeType === NoticeType.PAPER_RETURN) {
    return PaperReturnNotificationsPresenter.go(session, recipients, noticeId)
  }

  if (noticeType === NoticeType.RENEWAL_INVITATIONS) {
    return ReturnsInvitationNotificationsPresenter.go(session, recipients, noticeId)
  }

  return ReturnsNoticeNotificationsPresenter.go(session, recipients, noticeId)
}

export {
  go
}
export default {
  go
}
