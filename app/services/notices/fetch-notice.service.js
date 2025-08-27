'use strict'

/**
 * Fetch the selected notice and its associated notifications for the 'notices/{id}' page
 * @module FetchNoticeService
 */

const { db } = require('../../../db/db.js')
const EventModel = require('../../models/event.model.js')

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
  const params = [noticeId]
  const query = `
    SELECT
      *
    FROM (
      SELECT
        n.id,
        (CASE
          WHEN n.message_type = 'email' THEN n.recipient
          ELSE n.personalisation->>'address_line_1'
        END) AS "recipientName",
        n.licences,
        n.message_type AS "messageType",
        n.notify_status AS "notifyStatus",
        n.personalisation,
        n.status
      FROM
        public.notifications n
      WHERE
        n.event_id = ?
    ) notice_notifications
    ORDER BY
      notice_notifications."recipientName" ASC;
  `

  const result = await db.raw(query, params)

  return result.rows
}

module.exports = {
  go
}
