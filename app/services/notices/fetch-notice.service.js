'use strict'

/**
 * Fetch the selected notice and its associated notifications for the 'notices/{id}' page
 * @module FetchNoticeService
 */

const { ref } = require('objection')

const EventModel = require('../../models/event.model.js')
const NotificationModel = require('../../models/notification.model.js')

const databaseConfig = require('../../../config/database.config.js')

/**
 * Fetch the selected notice and its associated notifications for the 'notices/{id}' page
 *
 * @param {string} noticeId - the UUID of the selected notice
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the notice and its associated notifications
 */
async function go(noticeId, page) {
  const notice = await EventModel.query()
    .findById(noticeId)
    .select([
      'createdAt',
      'id',
      'issuer',
      'referenceCode',
      'status',
      'subtype',
      ref('metadata:options.sendingAlertType').castText().as('alertType'),
      'es.error_count',
      'es.pending_count'
    ])
    .joinRaw(
      `
      INNER JOIN (
        SELECT
          n.event_id,
          COUNT(*) FILTER (WHERE n.status = 'error') AS error_count,
          COUNT(*) FILTER (WHERE n.status = 'pending') AS pending_count
        FROM
          public.notifications n
        WHERE n.event_id = ?
        GROUP BY n.event_id
      ) es ON es.event_id = events.id
      `,
      [noticeId]
    )

  console.log(notice)

  const { results: notifications, total: totalNumber } = await _fetch(noticeId, page)

  return {
    notice,
    notifications,
    totalNumber
  }
}

async function _fetch(noticeId, page) {
  return NotificationModel.query()
    .select([
      'notifications.id',
      'rn.recipient_name',
      'notifications.licences',
      'notifications.messageType',
      'notifications.notifyStatus',
      'notifications.personalisation',
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
    .orderBy([
      { column: 'rn.recipient_name', order: 'asc' },
      { column: 'notifications.licences', order: 'asc' },
      { column: 'notifications.createdAt', order: 'asc' }
    ])
    .page(page - 1, databaseConfig.defaultPageSize)
}

module.exports = {
  go
}
