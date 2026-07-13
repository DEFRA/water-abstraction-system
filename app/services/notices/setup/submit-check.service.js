/**
 * Orchestrates creating the notice and sending the notifications when `/notices/setup/{sessionId}/check` page submitted
 * @module SubmitCheckService
 */

import CreateNoticeService from './create-notice.service.js'
import CreateNotificationsService from './create-notifications.service.js'
import DeleteSessionDal from '../../../dal/delete-session.dal.js'
import FetchRecipientsService from './fetch-recipients.service.js'
import FetchSessionDal from '../../../dal/fetch-session.dal.js'
import SendNoticeService from './send/send-notice.service.js'

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
export default async function (sessionId, auth) {
  const session = await FetchSessionDal(sessionId)

  const recipients = await FetchRecipientsService(session)

  await DeleteSessionDal(sessionId)

  const notice = await _notice(session, recipients, auth)

  const notifications = await _notifications(session, recipients, notice.id)

  // We do not await the result of this service. Sending paper returns can take a few seconds due to the need to
  // generate the PDFs. Returns invitations and reminders can take a few minutes because there can be thousands of
  // notifications to send. We've created the records by this point so we are safe to redirect the user to the
  // confirmation page, and from there the view notice page.
  //
  // But if we were to await the result they would see a timeout. So, we kick it off and then return to the controller.
  SendNoticeService(notice, notifications)

  return notice.id
}

async function _notifications(session, recipients, noticeId) {
  return CreateNotificationsService(session, recipients, noticeId)
}

async function _notice(session, recipients, auth) {
  return CreateNoticeService(session, recipients, auth.credentials.user.username)
}
