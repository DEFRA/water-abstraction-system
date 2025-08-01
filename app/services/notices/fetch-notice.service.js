'use strict'

/**
 * Fetches the notices for the 'notices/{id}' page
 * @module FetchNoticesService
 */

const { db } = require('../../../db/db.js')
const EventModel = require('../../models/event.model.js')

/**
 * Fetches the notice for the 'notices/{id}' page
 *
 * @param {string} id - the id of the scheduled notification to look up
 *
 * @returns {Promise<object[]>} an array of matching notices
 */
async function go(id) {
  const event = await EventModel.query()
    .findById(id)
    .select(['id', 'referenceCode', 'issuer', 'createdAt', 'status', 'subtype'])

  if (!event) {
    return undefined
  }

  const scheduledNotifications = await _query(id)

  return {
    event,
    results: scheduledNotifications.rows
  }
}

function _query(id) {
  const query = `
  SELECT * FROM (
    SELECT
      (CASE
          WHEN sn.message_type = 'email' THEN sn.recipient
          ELSE sn.personalisation->>'address_line_1'
      END) AS recipient_name,
      sn.licences,
      sn.message_type,
      sn.personalisation,
      sn.recipient,
      sn.status
    FROM water.scheduled_notification sn
    where sn.event_id = '${id}'
  ) notice_notifcations
  ORDER BY recipient_name ASC;
  `

  return db.raw(query)
}

module.exports = {
  go
}
