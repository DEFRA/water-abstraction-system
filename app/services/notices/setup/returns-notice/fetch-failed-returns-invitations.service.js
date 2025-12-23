'use strict'

/**
 * Fetches the licence refs and return logs IDs from failed returns invitation notifications to primary users
 * @module FetchFailedReturnsInvitationsService
 */

const NotificationModel = require('../../../../models/notification.model.js')
const { futureDueDate } = require('../../../../presenters/notices/base.presenter.js')
const { compareDates } = require('../../../../lib/dates.lib.js')

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

  const dueDate = _dueDate(notifications)
  const licences = []
  const notificationIds = []
  const returnLogIds = []

  for (const notification of notifications) {
    licences.push(...notification.licences)
    notificationIds.push(notification.id)
    returnLogIds.push(...notification.returnLogIds)
  }

  return {
    dueDate,
    licenceRefs: [...new Set(licences)].sort(),
    notificationIds,
    returnLogIds: [...new Set(returnLogIds)]
  }
}

/**
 * Determine the due date to assign to the alternate notifications
 *
 * Because we have to support both standard and ad-hoc returns invitations, we cannot leave the due date to always be
 * calculated as a future date.
 *
 * If what failed was an ad-hoc returns invitation, and the licence selected had no return logs with a null due date,
 * the notice engine would have used the latest due date in the notification.
 *
 * This means we need to do the same in the letter. However, if it was standard or it did have at least one return log
 * with a null due date, then it would have calculated the due date as today plus 28 (see `futureDueDate()`).
 *
 * So, we have to try and determine whether we stick with the due date in the failed notifications, or recalculate for
 * today plus 29 days.
 *
 * @private
 */
function _dueDate(notifications) {
  if (notifications.length === 0) {
    return null
  }

  // All the failed notifications will share the same due date, so we can just take it from the first one.
  const { dueDate: notificationDueDate } = notifications[0]
  const emailFutureDueDate = futureDueDate('email')

  // compareDates returns 0 if the dates are the same, which is how we decide whether to calculate the date or stick
  // with what is in the notification
  if (compareDates(notificationDueDate, emailFutureDueDate) === 0) {
    return futureDueDate('letter')
  }

  return notificationDueDate
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
    .select(['dueDate', 'id', 'licences', 'returnLogIds'])
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
