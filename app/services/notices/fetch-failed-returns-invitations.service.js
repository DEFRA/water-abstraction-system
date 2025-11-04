'use strict'

/**
 * Fetches the notifications which notify failed to send.
 * @module FetchFailedReturnsInvitationsService
 */

const { ref } = require('objection')

const NotificationModel = require('../../models/notification.model.js')

/**
 * Fetches the notifications which notify failed to send.
 *
 * The function returns a list of email 'notifications' from an event that GovNoitify returned an error for.
 *
 * This could have been because of a temporary issue or an invalid email address.
 *
 * @param {string} eventId - The event id to check.
 *
 * @returns {Promise<object[]>} - an array of 'notifications'
 */
async function go(eventId) {
  return NotificationModel.query()
    .select([
      'createdAt',
      'eventId',
      'id',
      'licences',
      'messageRef',
      'messageType',
      'notifyId',
      'notifyStatus',
      'notify_error',
      'personalisation',
      'status'
    ])
    .where('status', 'error')
    .andWhere('messageRef', 'returns_invitation_primary_user_email')
    .andWhere('eventId', eventId)
    .andWhere('messageType', 'email')
    .andWhereIsNull('alternateNotificationId')
}

// TODO - combine all of the licnces from this and return an array of unque licenceRefs

module.exports = {
  go
}
