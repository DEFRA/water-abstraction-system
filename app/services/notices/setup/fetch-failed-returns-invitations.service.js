'use strict'

/**
 * Fetches the licence refs and return logs IDs from failed returns invitation notifications to primary users
 * @module FetchFailedReturnsInvitationsService
 */

const NotificationModel = require('../../../models/notification.model.js')

/**
 * Fetches the licence refs and return logs IDs from failed returns invitation notifications to primary users
 *
 * The function checks a notice for failed return invitation emails to primary users.
 *
 * This could have been because of a temporary issue or an invalid email address.
 *
 * @param {string} noticeId - The notice UUID to check
 *
 * @returns {Promise<object>} An object with an array of failed return log ids and an array of failed licence refs
 */
async function go(noticeId) {
  const results = await _fetch(noticeId)

  const licences = []
  const returnIds = []

  for (const result of results) {
    licences.push(...(Array.isArray(result.licences) ? result.licences : [result.licences]))
    returnIds.push(...(Array.isArray(result.returnLogIds) ? result.returnLogIds : [result.returnLogIds]))
  }

  return {
    failedLicenceRefs: [...new Set(licences)],
    failedReturnIds: [...new Set(returnIds)]
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
    .select(['licences', 'returnLogIds'])
    .where('status', 'error')
    .where('messageRef', 'returns_invitation_primary_user_email')
    .where('eventId', eventId)
    .where('messageType', 'email')
    .whereNull('alternateNoticeId')
}

module.exports = {
  go
}
