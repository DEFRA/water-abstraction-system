'use strict'

/**
 * Orchestrates adding an empty object to the requirements array in the session
 * @module AddService
 */

const FetchSessionDal = require('../../../dal/fetch-session.dal.js')

/**
 * Orchestrates adding an empty object to the requirements array in the session
 *
 * Supports adding another object to the requirements array in the session when a user hits the 'Add another
 * requirement' button.
 *
 * @param {string} sessionId - The UUID of the current session
 *
 * @returns {Promise<number>} The index of the new requirement. Needed by the setup pages so they know which requirement
 * to display and update
 */
async function go(sessionId) {
  const session = await FetchSessionDal.go(sessionId)

  await _save(session)

  return session.requirements.length - 1
}

async function _save(session) {
  session.requirements.push({})

  session.checkPageVisited = false

  return session.$update()
}

module.exports = {
  go
}
