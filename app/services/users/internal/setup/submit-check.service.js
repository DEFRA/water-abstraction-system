'use strict'

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @module SubmitCheckService
 */

const CreateNotificationDal = require('../../../../dal/users/internal/create-notification.dal.js')
const CreateUserDal = require('../../../../dal/users/internal/create-user.dal.js')
const DeleteSessionDal = require('../../../../dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const SendVerificationEmailService = require('./send-verification-email.service.js')
const { flashNotification } = require('../../../../lib/general.lib.js')

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @param {object} auth - The current user's authentication details from `request.auth`
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go(auth, sessionId, yar) {
  const session = await FetchSessionDal.go(sessionId)
  const { email } = session

  await DeleteSessionDal.go(sessionId)

  const resetGuid = await CreateUserDal.go(auth, session)

  const notification = await CreateNotificationDal.go(email, resetGuid)

  flashNotification(yar, 'User added', `We have emailed ${email} instructions to complete their account set up.`)

  SendVerificationEmailService.go(notification)
}

module.exports = {
  go
}
