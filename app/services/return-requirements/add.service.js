'use strict'

/**
 * Orchestrates adding object to requirements array
 * @module AddService
 */

const SessionModel = require('../../models/session.model.js')

async function go (sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  await _save(session)

  return session.requirements.length - 1
}

async function _save (session) {
  session.requirements.push({})

  session.checkPageVisited = false

  return session.$update()
}
module.exports = {
  go
}
