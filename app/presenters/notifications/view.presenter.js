'use strict'

/**
 * Formats data for the `/notifications` page
 * @module ViewNotificationsPresenter
 */

const { formatLongDate } = require('../base.presenter.js')
const SentDateValidator = require('../../validators/notifications/view.validator.js')

/**
 * Formats data for the `/notifications` page
 *
 * @param {object} data - The object containing the notifcations sent
 * @param {object} filters - The object containing the notifcation filters
 *
 * @returns {object} - The data formatted for the view template
 */
function go(data, filters) {
  const { filterNotificationTypes } = filters
  const _filterNotificationTypes = filters.filterNotificationTypes
    ? _prepareNotifications(filterNotificationTypes)
    : filterNotificationTypes

  const validateDatesResult = _validate(filters)
console.log(validateDatesResult)
  const filter = {
    notifications: _filterNotificationTypes,
    ...filters
  }

  // this opens the filter on the page if any filter data has been received so the user can see the applied filters
  filter.openFilter = _openFilter(filter)

  return {
    backLink: '/manage',
    error: validateDatesResult,
    filter,
    headers: _tableHeaders(),
    rows: _tableRows(data),
    pageTitle: 'View sent notices'
  }
}

function _openFilter(filter) {
  return (
    (filter.fromFullDate ||
      filter.toFullDate ||
      filter.filterNotificationTypes ||
      filter.sentBy ||
      filter.sentFromDay ||
      filter.sentFromMonth ||
      filter.sentFromYear ||
      filter.sentToDay ||
      filter.sentToMonth ||
      filter.sentToYear) !== undefined
  )
}

function _prepareNotifications(filterNotificationTypes) {
  return {
    legacyNotifications: filterNotificationTypes.includes('legacy-notifications'),
    returnsPaperForm: filterNotificationTypes.includes('returns-paper-form'),
    returnsReminders: filterNotificationTypes.includes('returns-reminders'),
    returnsInvitation: filterNotificationTypes.includes('returns-invitation'),
    waterAbstractionAlertResume: filterNotificationTypes.includes('water-abstraction-alert-resume'),
    waterAbstractionAlertStop: filterNotificationTypes.includes('water-abstraction-alert-stop'),
    waterAbstractionAlertReduce: filterNotificationTypes.includes('water-abstraction-alert-reduce'),
    waterAbstractionAlertWarning: filterNotificationTypes.includes('water-abstraction-alert-warning')
  }
}

function _tableHeaders() {
  return [
    {
      text: 'Date'
    },
    {
      text: 'Notification type'
    },
    {
      text: 'Sent by'
    },
    {
      text: 'Recipients'
    },
    {
      text: 'Problems'
    }
  ]
}

function _tableRows(data) {
  const rows = []

  for (const notification of data) {
    const name = notification.alertType === 'warning' ? 'Warning - ' + notification.name : notification.name
    rows.push([
      { text: formatLongDate(notification.createdAt) },
      { html: `<a href="/notifications/report/${notification.id}">${name}</a>` },
      { text: notification.issuer },
      { text: notification.recipientCount, format: 'numeric' },
      { text: notification.errorCount, format: 'numeric' }
    ])
  }

  return rows
}

function _validate(filters) {
  const { sentFromDay, sentFromMonth, sentFromYear, sentBy, sentToDay, sentToMonth, sentToYear } = filters

  if (!sentFromDay && !sentFromMonth && !sentFromYear && !sentToDay && !sentToMonth && !sentToYear && !sentBy) {
    return null
  }

  const validation = SentDateValidator.go(filters)
// console.log(validation)
// console.log(validation.error.details[0])
  if (!validation.error) {
    return null
  }

  const toDateError = validation.error.details.find((detail) => detail.context.key === 'toFullDate')
  const fromDateError = validation.error.details.find((detail) => detail.context.key === 'fromFullDate')
  const sentByError = validation.error.details.find((detail) => detail.context.key === 'sentBy')

  return {
    text: 'There was a problem with your filters.',
    ...(fromDateError && { fromFullDate: { message: fromDateError.message } }),
    ...(toDateError && { toFullDate: { message: toDateError.message } }),
    ...(sentByError && { sentBy: { message: sentByError.message } })
  }
}

module.exports = {
  go
}
