'use strict'

/**
 * Fetches the notifications for the `/notifications` page
 * @module FetchEventsService
 */

const { ref } = require('objection')

const EventModel = require('../../models/event.model.js')

/**
 * Fetches the notifications for the `/notifications` page
 *
 * @returns {Promise<object[]>}
 */
async function go() {
  return EventModel.query()
    .select([
      'id',
      'createdAt',
      'issuer',
      ref('metadata:name').castText().as('name'),
      ref('metadata:options.sendingAlertType').castText().as('alertType'),
      ref('metadata:recipients').castInt().as('recipientCount'),
      ref('metadata:error').castInt().as('errorCount')
    ])
    .where('type', 'notification')
    .whereIn('status', ['sent', 'completed', 'sending'])
    .orderBy('createdAt', 'desc')
}

module.exports = {
  go
}
