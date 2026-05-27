'use strict'

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @module SubmitCheckService
 */

const CreateUserDal = require('../../../../dal/users/internal/create-user.dal.js')
const DeleteSessionDal = require('../../../../dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const { flashNotification } = require('../../../../lib/general.lib.js')

/**
 * Orchestrates validating the data for the '/users/internal/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - The UUID of the current session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 */
async function go(sessionId, yar) {
  const session = await FetchSessionDal.go(sessionId)

  await DeleteSessionDal.go(sessionId)

  try {
    await CreateUserDal.go(session)

    flashNotification(
      yar,
      `User "${session.email}" added`,
      'We have emailed the new user instructions to complete their account set up.'
    )
  } catch {
    flashNotification(
      yar,
      `User "${session.email}" not added`,
      'There was a problem adding the user. Please try again.'
    )
  }
}

module.exports = {
  go
}
