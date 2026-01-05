'use strict'

/**
 * Connects with the water-abstraction-service to sign in a user
 *
 * @module SigninInternalUserRequest
 */

const LegacyUiRequest = require('../legacy-ui.request.js')

/**
 * Send a request to the legacy water-abstraction-ui to sign in a user
 *
 * Although we now sign in users ourselves, the legacy application still needs to initialise its session for the signed
 * in user.
 *
 * It does this by creating a session cookie that is linked to its Redis session cache. We therefore need to call its
 * sign-in endpoint to get that cookie set up.
 *
 * This request performs that sign-in, but is only interested in the cookie value, which can then be added to our own
 * response so that it is sent to the browser.
 *
 * @param {string} username - the verified and signed-in user's username (email address)
 * @param {string} password - the verified and signed-in user's password
 *
 * @returns {Promise<object>} The result of the request; whether it succeeded and the response or error returned
 */
async function send(username, password) {
  const path = 'signin'
  const body = {
    email: username,
    password
  }

  return LegacyUiRequest.post('internal', path, body)
}

module.exports = {
  send
}
