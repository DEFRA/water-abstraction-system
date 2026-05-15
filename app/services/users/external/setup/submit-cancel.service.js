'use strict'

/**
 * Orchestrates cancelling the data for the '/users/external/setup/{sessionId}/cancel' page
 *
 * @module SubmitCancelService
 */

const DeleteSessionDal = require('../../../../dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../dal/fetch-session.dal.js')

/**
 * Orchestrates cancelling the data for the '/users/external/setup/{sessionId}/cancel' page
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  await DeleteSessionDal.go(sessionId)

  const { user } = session

  return {
    redirectUrl: `/system/users/external/${user.id}/licences?back=${session.activeNavBar}`
  }
}

module.exports = {
  go
}
