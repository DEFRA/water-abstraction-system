'use strict'

/**
 * Orchestrates creating the notifications for Notify and saving the notification to 'water.notifications'
 * @module DetermineNotificationsService
 */

const AbstractionAlertNotificationsPresenter = require('../../../presenters/notices/setup/abstraction-alert-notifications.presenter.js')
const DetermineReturnFormsService = require('./determine-return-forms.service.js')
const NotificationsPresenter = require('../../../presenters/notices/setup/notifications.presenter.js')

/**
 * Orchestrates creating the notifications for Notify and saving the notification to 'water.notifications'
 *
 * @param {SessionModel} session - The session instance
 * @param {object[]} recipients - The recipients to create notifications for
 * @param {string} eventId - the event UUID to link all the notifications to
 *
 * @returns {Promise<object[]>} An array of notification formatted to persist and send
 */
async function go(session, recipients, eventId) {
  let notifications

  if (session.journey === 'alerts') {
    notifications = AbstractionAlertNotificationsPresenter.go(recipients, session, eventId)
  } else if (session.noticeType === 'returnForms') {
    notifications = await DetermineReturnFormsService.go(session, recipients, eventId)
  } else {
    notifications = NotificationsPresenter.go(recipients, session, eventId)
  }

  return notifications
}

module.exports = {
  go
}
