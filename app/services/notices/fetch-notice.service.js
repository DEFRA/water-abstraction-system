'use strict'

/**
 * Fetch the selected notice and its associated notifications for the 'notices/{id}' page
 * @module FetchNoticeService
 */

const EventModel = require('../../models/event.model.js')
const NotificationModel = require('../../models/notification.model.js')

/**
 * Fetch the selected notice and its associated notifications for the 'notices/{id}' page
 *
 * @param {string} noticeId - the UUID of the selected notice
 *
 * @returns {Promise<object>} the notice and its associated notifications
 */
async function go(noticeId) {
  const notice = await EventModel.query()
    .findById(noticeId)
    .select(['createdAt', 'id', 'issuer', 'referenceCode', 'status', 'subtype'])

  const notifications = await _fetch(noticeId)

  return {
    notice,
    notifications
  }
}

async function _fetch(noticeId) {
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
}

module.exports = {
  go
}
