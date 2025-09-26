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
  const { journey, noticeType } = session

  if (journey === 'alerts') {
    return AbstractionAlertNotificationsPresenter.go(recipients, session, eventId)
  }

  if (noticeType === 'returnForms') {
    return DetermineReturnFormsService.go(session, recipients, eventId)
  }

  return NotificationsPresenter.go(recipients, session, eventId)
}

module.exports = {
  go
}
