'use strict'

/**
 * Orchestrates handling the data for `/notices/setup/{sessionId}/check` page
 * @module SubmitCheckService
 */

const BatchNotificationsService = require('./batch-notifications.service.js')
const CreateNoticePresenter = require('../../../presenters/notices/setup/create-notice.presenter.js')
const CreateNoticeService = require('./create-notice.service.js')
const CreateNotificationsService = require('./create-notifications.service.js')
const DetermineNotificationsService = require('./determine-notifications.service.js')
const FetchNotificationsService = require('./fetch-notifications.service.js')
const FetchRecipientsService = require('./fetch-recipients.service.js')
const SessionModel = require('../../../models/session.model.js')
const { currentTimeInNanoseconds, calculateAndLogTimeTaken } = require('../../../lib/general.lib.js')

/**
 * Orchestrates handling the data for `/notices/setup/{sessionId}/check` page
 *
 * This service will transform the recipients into notifications and start processing notifications.
 *
 * @param {string} sessionId - The UUID for the notice setup session record
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<string>} - the created notice Id
 */
async function go(sessionId, auth) {
  const session = await SessionModel.query().findById(sessionId)

  const recipients = await FetchRecipientsService.go(session)

  const sessionCopy = session

  await session.$query().delete()

  const notice = await _notice(sessionCopy, recipients, auth)

  const notifications = await _notifications(sessionCopy, recipients, notice.id)

  _processNotifications(notifications, notice, sessionCopy.referenceCode)

  return notice.id
}

/**
 * Determine the notifications to send for the recipients.
 *
 * Save the notifications as 'pending' (we are about to start batching).
 *
 * Return the saved notifications with the notification id (this will be used to update the status of the notification
 * during the batch process).
 *
 * @returns {Promise<object>} an array of saved notifications
 *
 * @private
 */
async function _notifications(sessionCopy, recipients, eventId) {
  const notifications = await DetermineNotificationsService.go(sessionCopy, recipients, eventId)

  await CreateNotificationsService.go(notifications)

  return FetchNotificationsService.go(eventId)
}

async function _notice(session, recipients, auth) {
  const event = CreateNoticePresenter.go(session, recipients, auth)

  return CreateNoticeService.go(event)
}

async function _processNotifications(notifications, notice, referenceCode) {
  try {
    const startTime = currentTimeInNanoseconds()

    await BatchNotificationsService.go(notifications, notice.id, referenceCode)

    calculateAndLogTimeTaken(startTime, 'Send notifications complete', {})
  } catch (error) {
    global.GlobalNotifier.omfg('Send notifications failed', { notice }, error)
  }
}

module.exports = {
  go
}
