/**
 * Fetch the selected notice and its associated notifications for the 'notices/{id}' page
 * @module FetchNoticeService
 */

import DatabaseConfig from 'water-abstraction-engine/config/database.config.js'
import EventModel from 'water-abstraction-engine/models/event.model.js'
import NotificationModel from 'water-abstraction-engine/models/notification.model.js'
import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'

/**
 * Fetch the selected notice and its associated notifications for the 'notices/{id}' page
 *
 * @param {string} noticeId - the UUID of the selected notice
 * @param {object} filters - an object containing the different filters to apply to the query
 * @param {string} [page='1'] - The current page for the pagination service
 *
 * @returns {Promise<object>} the notice and its associated notifications
 */
export default async function fetchNoticeService(noticeId, filters, page = '1') {
  const notice = await _fetchNotice(noticeId)

  const notificationsQuery = _fetchNotificationsQuery(noticeId)

  _applyFilters(notificationsQuery, filters)

  notificationsQuery
    .orderBy([
      { column: 'rn.recipient_name', order: 'asc' },
      { column: 'notifications.licences', order: 'asc' },
      { column: 'notifications.createdAt', order: 'asc' }
    ])
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)

  const { results: notifications, total: totalNumber } = await notificationsQuery

  return {
    notice,
    notifications,
    totalNumber
  }
}

function _applyFilters(query, filters) {
  const { status, licence, recipient } = filters

  if (recipient) {
    query.whereILike('rn.recipient_name', `%${recipient}%`)
  }

  if (status) {
    query.where('notifications.status', '=', status)
  }

  if (licence) {
    query.where('notifications.licences', '?', licence)
  }
}

async function _fetchNotice(noticeId) {
  return EventModel.query()
    .findById(noticeId)
    .select([
      'createdAt',
      'id',
      'issuer',
      'overallStatus',
      'referenceCode',
      'status',
      'subtype',
      Objection.ref('metadata:options.sendingAlertType').castText().as('alertType')
    ])
}

function _fetchNotificationsQuery(noticeId) {
  return NotificationModel.query()
    .select([
      'notifications.id',
      'notifications.licences',
      'notifications.messageType',
      'notifications.notifyStatus',
      'notifications.personalisation',
      'rn.recipient_name',
      'notifications.status'
    ])
    .joinRaw(
      `
      INNER JOIN (
        SELECT
          rn.id,
          (CASE
            WHEN rn.message_type = 'email' THEN rn.recipient
            ELSE rn.personalisation->>'address_line_1'
          END) AS recipient_name
        FROM
          public.notifications rn
        WHERE
          rn.event_id = ?
      ) rn ON rn.id = notifications.id
      `,
      [noticeId]
    )
    .where('event_id', noticeId)
}
