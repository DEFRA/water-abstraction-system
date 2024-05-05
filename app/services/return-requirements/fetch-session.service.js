'use strict'

/**
 * Fetches the current return requirement session and makes properties of `data` available to callers
 * @module FetchSessionService
 */

const SessionModel = require('../../models/session.model.js')

/**
 * Fetches the current return requirement session and makes properties of `data` available to callers
 *
 * @param {string} sessionId - The UUID for return requirement setup session record
 *
 * @returns {Promise<Object>} the ID of the session record plus all data stored in the `data` property exposed as direct
 * properties
 */
async function go (sessionId) {
  const { id, data } = await SessionModel.query().findById(sessionId)

  return {
    id,
    update: _update,
    ...data
  }
}

async function _update () {
  const { id, ...currentData } = this

  return SessionModel.query().findById(id).patch({ data: currentData })
}

module.exports = {
  go
}
