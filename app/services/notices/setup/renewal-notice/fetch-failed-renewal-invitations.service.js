/**
 * Fetches the licence refs from failed renewal invitation notifications to primary users
 * @module FetchFailedRenewalInvitationsService
 */

import NotificationModel from '../../../../models/notification.model.js'
import { compareStrings } from '../../../../lib/general.lib.js'

/**
 * Fetches the licence refs from failed renewal invitation notifications to primary users
 *
 * The function checks a notice for failed renewal invitation emails to primary users.
 *
 * This could have been because of a temporary issue or an invalid email address.
 *
 * @param {string} noticeId - The notice UUID to check
 *
 * @returns {Promise<object>} An object containing the IDs of the failed notifications, plus the combined licence
 * references from them
 */
export default async function go(noticeId) {
  const notifications = await _fetch(noticeId)

  const licences = []
  const notificationIds = []

  for (const notification of notifications) {
    licences.push(...notification.licences)
    notificationIds.push(notification.id)
  }

  return {
    licenceRefs: [...new Set(licences)].sort((referenceString, compareString) => {
      return compareStrings(referenceString, compareString)
    }),
    notificationIds: [...notificationIds].sort((referenceString, compareString) => {
      return compareStrings(referenceString, compareString)
    })
  }
}

/**
 * We are only interested in renewal invitation emails that have failed.
 *
 * The alternateNoticeId is set when we have successfully created a new notification to replace the failed one. Hence we
 * only look for ones that have not been set. This enables us to retry sending them if something has gone wrong.
 *
 * @private
 */
async function _fetch(eventId) {
  return NotificationModel.query()
    .select(['id', 'licences'])
    .where('eventId', eventId)
    .where('status', 'error')
    .where('messageRef', 'renewal invitation')
    .where('contactType', 'primary user')
    .where('messageType', 'email')
    .whereNull('alternateNoticeId')
}
