'use strict'

/**
 * Fetches the licence refs and return logs IDs from failed returns invitation notifications to primary users
 * @module FetchFailedReturnsInvitationsService
 */

const NotificationModel = require('../../../../models/notification.model.js')

/**
 * Fetches the licence refs and return logs IDs from failed returns invitation notifications to primary users
 *
 * The function checks a notice for failed return invitation emails to primary users.
 *
 * This could have been because of a temporary issue or an invalid email address.
 *
 * @param {string} noticeId - The notice UUID to check
 *
 * @returns {Promise<object>} An object containing the IDs of the failed notifications, plus the combined return log IDs
 * and licence references from them
 */
async function go(noticeId) {
  const notifications = await _fetch(noticeId)

  const licences = []
  const notificationIds = []
  const returnLogIds = []

  for (const notification of notifications) {
    licences.push(...notification.licences)
    notificationIds.push(notification.id)
    returnLogIds.push(...notification.returnLogIds)
  }

  return {
    licenceRefs: [...new Set(licences)].sort(),
    notificationIds,
    returnLogIds: [...new Set(returnLogIds)]
  }
}

/**
 * We are only interested in return invitation emails that have failed.
 *
 * The alternateNoticeId is set when we have successfully created a new notification to replace the failed one. Hence we
 * only look for ones that have not been set. This enables us to retry sending them if something has gone wrong.
 *
 * @private
 */
async function _fetch(eventId) {
  return NotificationModel.query()
    .select(['id', 'licences', 'returnLogIds'])
    .where('eventId', eventId)
    .where('status', 'error')
    .whereIn('messageRef', ['returns invitation', 'returns invitation ad-hoc'])
    .where('contactType', 'primary user')
    .where('messageType', 'email')
    .whereNull('alternateNoticeId')
}

module.exports = {
  go
}
