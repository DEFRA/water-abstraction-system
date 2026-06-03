'use strict'

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @module SubmitCheckService
 */

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

  try {
    const notification = await CreateUserDal.go(auth, session)

    const notificationStatus = await SendVerificationEmailService.go(notification)

    if (notificationStatus === 'error') {
      flashNotification(
        yar,
        `User "${email}" added`,
        'There was a problem sending the new user instructions to complete their account set up.'
      )
    } else {
      flashNotification(
        yar,
        `User "${email}" added`,
        'We have emailed the new user instructions to complete their account set up.'
      )
    }
  } catch {
    flashNotification(yar, `User "${email}" not added`, 'There was a problem adding the user. Please try again.')
  }
}

module.exports = {
  go
}
