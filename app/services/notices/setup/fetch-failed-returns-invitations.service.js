'use strict'

/**
 * Fetches the notifications which notify failed to send.
 * @module FetchFailedReturnsInvitationsService
 */

const NotificationModel = require('../../../models/notification.model.js')

/**
 * Fetches the notifications which notify failed to send.
 *
 * The function returns a list of email 'notifications' from an event that GovNoitify returned an error for.
 *
 * This could have been because of a temporary issue or an invalid email address.
 *
 * @param {string} eventId - The event id to check.
 *
 * @returns {string[]} - an array of unique 'returnLogIds'
 */
async function go(eventId) {
  const results = await _query(eventId)

  if (results.length === 0) {
    return []
  }

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
async function _query(eventId) {
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
