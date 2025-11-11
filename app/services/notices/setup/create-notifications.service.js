'use strict'

/**
 * Create the notifications for a new notice based on the notice setup data and then return them
 * @module CreateNotificationsService
 */

const AbstractionAlertNotificationsPresenter = require('../../../presenters/notices/setup/abstraction-alert-notifications.presenter.js')
const PaperReturnNotificationsPresenter = require('../../../presenters/notices/setup/paper-return-notifications.presenter.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const NotificationsPresenter = require('../../../presenters/notices/setup/notifications.presenter.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')
const { NoticeType } = require('../../../lib/static-lookups.lib.js')

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

  for (const notification of notifications) {
    const persistedNotification = await NotificationModel.query()
      .insert({
        ...notification,
        createdAt: timestampForPostgres()
      })
      .returning([
        'createdAt',
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

  return NotificationsPresenter.go(session, recipients, noticeId)
}

module.exports = {
  go
}
