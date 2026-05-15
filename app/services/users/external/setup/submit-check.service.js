'use strict'

/**
 * Orchestrates validating the data for the '/users/external/setup/{sessionId}/check' page
 *
 * @module SubmitCheckService
 */

const DeleteSessionDal = require('../../../../dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')
const { flashNotification } = require('../../../../lib/general.lib.js')

/**
 * Orchestrates validating the data for the '/users/external/setup/{sessionId}/check' page
 *
 * @param {string} sessionId - the UUID of the session
 * @param {object} yar - The Hapi `request.yar` session manager passed on by the controller
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId, yar, auth) {
  console.log('🚀🚀🚀 ~ auth:')
  console.dir(auth, { depth: null, colors: true })
  const sessionData = await FetchSessionDal.go(sessionId)

  await DeleteSessionDal.go(sessionId)

  await _unlinkLicences(sessionData, yar)

  flashNotification(yar, 'Updated', 'Licences unlinked.')

  return { redirectUrl: `/system/users/external/${sessionData.user.id}/licences` }
}

async function _unlinkLicences(session) {
  console.log('🚀🚀🚀 ~ session:')
  console.dir(session, { depth: null, colors: true })
}

module.exports = {
  go
}
