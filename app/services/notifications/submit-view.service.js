'use strict'

/**
 * Updates the session cookie with the filter data needed for the notifications page
 * @module SubmitViewNotificationsService
 */

/**
 * Updates the session cookie with the filter data needed for the notifications page
 *
 * @param {object} payload - The `request.payload` containing the filter data.
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The error details if any
 */
async function go(payload, yar) {
  const clearFilters = payload?.clearFilters
  const sentFromDay = payload["sent-from-day"] ? payload["sent-from-day"] : null
  const sentFromMonth = payload["sent-from-month"] ? payload["sent-from-month"] : null
  const sentFromYear = payload["sent-from-year"] ? payload["sent-from-year"] : null
  const sentToDay = payload["sent-to-day"] ? payload["sent-to-day"] : null
  const sentToMonth = payload["sent-to-month"] ? payload["sent-to-month"] : null
  const sentToYear = payload["sent-to-year"] ? payload["sent-to-year"] : null
  const filterNotificationTypes = payload?.filterNotificationTypes
  const sentBy = payload?.sentBy

  if (clearFilters) {
    yar.clear('notifications-filter')
  } else {
    yar.set('notifications-filter', {
      filterNotificationTypes,
      sentBy,
      sentFromDay,
      sentFromMonth,
      sentFromYear,
      sentToDay,
      sentToMonth,
      sentToYear
    })
  }
}

module.exports = {
  go
}
