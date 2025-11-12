'use strict'

/**
 * Orchestrates creating the notice and sending the notifications when `/notices/setup/{sessionId}/check` page submitted
 * @module SubmitCheckService
 */

const CreateNoticeService = require('./create-notice.service.js')
const CreateNotificationsService = require('./create-notifications.service.js')
const FetchRecipientsService = require('./fetch-recipients.service.js')
const SendNoticeService = require('./send-notice.service.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * Orchestrates creating the notice and sending the notifications when `/notices/setup/{sessionId}/check` page submitted
 *
 * This service will transform the recipients into notifications and start sending them as notifications.
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

  // We do not await the result of this service. Sending paper returns can take a few seconds due to the need to
  // generate the PDFs. Returns invitations and reminders can take a few minutes because there can be thousands of
  // notifications to send. We've created the records by this point so we are safe to redirect the user to the
  // confirmation page, and from there the view notice page.
  //
  // But if we were to await the result they would see a timeout. So, we kick it off and then return to the controller.
  SendNoticeService.go(notice, notifications)

  return notice.id
}

async function _notifications(session, recipients, noticeId) {
  return CreateNotificationsService.go(session, recipients, noticeId)
}

async function _notice(session, recipients, auth) {
  return CreateNoticeService.go(session, recipients, auth.credentials.user.username)
}

module.exports = {
  go
}
