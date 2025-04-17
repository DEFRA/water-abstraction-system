'use strict'

/**
 * Orchestrates presenting the data for `/notifications` page
 * @module ViewNotificationsService
 */

const FetchEventsNotificationsService = require('./fetch-events-notifications.service.js')
const NotificationsIndexPresenter = require('../../presenters/notifications/index-notifications.presenter.js')
const NotificationsIndexValidator = require('../../validators/notifications/index.validator.js')

/**
 * Orchestrates presenting the data for `/notifications` page
 *
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} The view data for the notifications page
 */
async function go(yar) {
  const savedFilters = await _filters(yar)

  const filter = _convertTypesToBooleanFlags(savedFilters)
  const validateResult = _validate(savedFilters)

  let data = []

  if (!validateResult) {
    data = await FetchEventsNotificationsService.go(filter)
  }

  const formattedData = await NotificationsIndexPresenter.go(data)

  return {
    activeNavBar: 'manage',
    error: validateResult,
    filter,
    ...formattedData
  }
}

function _convertTypesToBooleanFlags(filters) {
  const { filterNotificationTypes } = filters

  const _filterNotificationTypes = filters.filterNotificationTypes
    ? _prepareNotifications(filterNotificationTypes)
    : filterNotificationTypes

  const filter = {
    notifications: _filterNotificationTypes,
    ...filters
  }

  // this opens the filter on the page if any filter data has been received so the user can see the applied filters
  filter.openFilter = _openFilter(filter)

  return filter
}

function _errorySummary(text, href) {
  return {
    text,
    href
  }
}

async function _filters(yar) {
  const filters = yar.get('notifications-filter')
  const filterNotificationTypes = filters?.filterNotificationTypes
  const sentBy = filters?.sentBy
  const sentFromDay = filters?.sentFromDay
  const sentFromMonth = filters?.sentFromMonth
  const sentFromYear = filters?.sentFromYear
  const sentToDay = filters?.sentToDay
  const sentToMonth = filters?.sentToMonth
  const sentToYear = filters?.sentToYear

  // NOTE: This bit of JavaScript magic will only add the value as a property to the object we're returning,
  // if the value exists. In this case, it avoids having masses of if () {} statements.
  return {
    ...(filterNotificationTypes && { filterNotificationTypes }),
    ...(sentBy && { sentBy }),
    ...(sentFromDay && { sentFromDay }),
    ...(sentFromMonth && { sentFromMonth }),
    ...(sentFromYear && { sentFromYear }),
    ...(sentToDay && { sentToDay }),
    ...(sentToMonth && { sentToMonth }),
    ...(sentToYear && { sentToYear })
  }
}

function _openFilter(filter) {
  return (
    (filter.filterNotificationTypes ||
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
    returnReminders: filterNotificationTypes.includes('returns-reminders'),
    returnInvitation: filterNotificationTypes.includes('returns-invitation'),
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

  const validation = NotificationsIndexValidator.go(filters)

  if (!validation.error) {
    return null
  }

  const error = {}
  const errorSummary = []

  const toDateError = validation.error.details.find((detail) => {
    return detail.context.key === 'toFullDate'
  })
  const fromDateError = validation.error.details.find((detail) => {
    return detail.context.key === 'fromFullDate'
  })
  const sentByError = validation.error.details.find((detail) => {
    return detail.context.key === 'sentBy'
  })

  if (toDateError) {
    errorSummary.push(_errorySummary(toDateError.message, '#sent-to'))
    error.toFullDate = { message: toDateError.message }
  }

  if (fromDateError) {
    errorSummary.push(_errorySummary(fromDateError.message, '#sent-from'))
    error.fromFullDate = { message: fromDateError.message }
  }

  if (sentByError) {
    errorSummary.push(_errorySummary(sentByError.message, '#sent-by'))
    error.sentByError = { message: sentByError.message }
  }

  error.summary = errorSummary

  return error
}

module.exports = {
  go
}
