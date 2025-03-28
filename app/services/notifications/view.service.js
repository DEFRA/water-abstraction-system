'use strict'

/**
 * Orchestrates presenting the data for `/notifications` page
 * @module ViewNotificationsService
 */

const FetchScheduledNotificationsService = require('./fetch-events-notifications.service.js')
const ViewNotificationsPresenter = require('../../presenters/notifications/view.presenter.js')
const ViewNotificationsValidator = require('../../validators/notifications/view.validator.js')

/**
 * Orchestrates presenting the data for `/notifications` page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The view data for the notifications page
 */
async function go(yar) {
  const filters = await _getFilters(yar)

  const { filterNotificationTypes } = filters
  const _filterNotificationTypes = filters.filterNotificationTypes
    ? _prepareNotifications(filterNotificationTypes)
    : filterNotificationTypes

  const validateResult = _validate(filters)

  const filter = {
    notifications: _filterNotificationTypes,
    ...filters
  }

  // this opens the filter on the page if any filter data has been received so the user can see the applied filters
  filter.openFilter = _openFilter(filter)

  let data = []

  if (!validateResult) {
    data = await FetchScheduledNotificationsService.go(filter)
  }

  const formattedData = ViewNotificationsPresenter.go(data, filter, validateResult)

  return {
    activeNavBar: 'manage',
    ...formattedData
  }
}

async function _getFilters(yar) {
  const filters = yar.get('notifications-filter')
  const filterNotificationTypes = filters?.filterNotificationTypes
  const sentBy = filters?.sentBy
  const sentFromDay = filters?.sentFromDay
  const sentFromMonth = filters?.sentFromMonth
  const sentFromYear = filters?.sentFromYear
  const sentToDay = filters?.sentToDay
  const sentToMonth = filters?.sentToMonth
  const sentToYear = filters?.sentToYear

  return {
    filterNotificationTypes,
    sentBy,
    sentFromDay,
    sentFromMonth,
    sentFromYear,
    sentToDay,
    sentToMonth,
    sentToYear
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

function _validate(filters) {
  const { sentFromDay, sentFromMonth, sentFromYear, sentBy, sentToDay, sentToMonth, sentToYear } = filters

  if (!sentFromDay && !sentFromMonth && !sentFromYear && !sentToDay && !sentToMonth && !sentToYear && !sentBy) {
    return null
  }

  const validation = ViewNotificationsValidator.go(filters)
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
