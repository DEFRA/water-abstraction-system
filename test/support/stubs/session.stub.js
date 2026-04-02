'use strict'

const SessionModel = require('../../../app/models/session.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Creates a stubbed instance of the SessionModel for testing purposes.
 *
 * @param {sinon} sinon - The sinon sandbox or instance.
 * @param {object} sessionData - The raw data to populate the model with.
 *
 * @returns {SessionModel} A model instance with stubbed methods.
 */
function build(sinon, sessionData) {
  const session = SessionModel.fromJson({
    id: generateUUID(),
    ...sessionData
  })

  sinon.stub(session, '$update').resolves(session)

  return session
}

module.exports = {
  build
}
