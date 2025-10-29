'use strict'

/**
 * Orchestrates creating the notifications for Notify and saving the notification to 'water.notifications'
 * @module DetermineNotificationsService
 */

const AbstractionAlertNotificationsPresenter = require('../../../presenters/notices/setup/abstraction-alert-notifications.presenter.js')
const DeterminePaperReturnService = require('./determine-paper-return.service.js')
const NotificationsPresenter = require('../../../presenters/notices/setup/notifications.presenter.js')
const { NoticeType } = require('../../../lib/static-lookups.lib.js')

/**
 * Orchestrates creating the notifications for Notify and saving the notification to 'water.notifications'
 *
 * @param {SessionModel} session - The session instance
 * @param {object[]} recipients - The recipients to create notifications for
 * @param {string} eventId - the event UUID to link all the notifications to
 *
 * @returns {object[]} An array of notification formatted to persist and send
 */
function go(session, recipients, eventId) {
  const { noticeType } = session

  if (noticeType === NoticeType.ABSTRACTION_ALERTS) {
    return AbstractionAlertNotificationsPresenter.go(recipients, session, eventId)
  }

  if (noticeType === NoticeType.PAPER_RETURN) {
    return DeterminePaperReturnService.go(session, recipients, eventId)
  }

  return NotificationsPresenter.go(recipients, session, eventId)
}

module.exports = {
  go
}
