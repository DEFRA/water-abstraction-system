'use strict'

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @module SubmitCheckService
 */

const CreateUserDal = require('../../../../dal/users/internal/create-user.dal.js')
const CreateVerificationNotificationDal = require('../../../../dal/users/internal/create-verification-notification.dal.js')
const DeleteSessionDal = require('../../../../dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const SendVerificationEmailService = require('./send-verification-email.service.js')
const UpdateUserDal = require('../../../../dal/users/internal/update-user.dal.js')
const { flashNotification } = require('../../../../lib/general.lib.js')

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @param {object} auth - The current user's authentication details from `request.auth`
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 *
 * @returns {Promise<object>} An object containing the URL to redirect the user to after confirming
 */
async function go(auth, sessionId, yar) {
  const session = await FetchSessionDal.go(sessionId)

  await DeleteSessionDal.go(sessionId)

  if (session.user) {
    await _updateUser(auth, session, yar)
  } else {
    await _createUser(auth, session, yar)
  }

  return {
    redirectUrl: '/system/users'
  }
}

async function _updateUser(auth, session, yar) {
  const { email } = session

  const resetGuid = await UpdateUserDal.go(auth, session)

  // A resetGuid will only exist if the users email has been updated. This can only happen if the user has not yet
  // verified their email address
  if (resetGuid) {
    const notification = await CreateVerificationNotificationDal.go(email, resetGuid)

    flashNotification(yar, 'User updated', `We have emailed ${email} instructions to complete their account set up.`)

    // Intentionally not awaited — fire-and-forget with internal error handling
    SendVerificationEmailService.go(notification)
  } else {
    flashNotification(yar, 'User updated', `User ${email} has been updated.`)
  }
}

async function _createUser(auth, session, yar) {
  const { email } = session

  const resetGuid = await CreateUserDal.go(auth, session)

  const notification = await CreateVerificationNotificationDal.go(email, resetGuid)

  flashNotification(yar, 'User added', `We have emailed ${email} instructions to complete their account set up.`)

  // Intentionally not awaited — fire-and-forget with internal error handling
  SendVerificationEmailService.go(notification)
}

module.exports = {
  go
}
