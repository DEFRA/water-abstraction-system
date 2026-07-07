import SessionModel from '../../../app/models/session.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

/**
 * Creates a stubbed instance of the SessionModel for testing purposes.
 *
 * @param {object} _sinon - Unused. Retained for call-site compatibility until Phase 4 (Sinon removal).
 * @param {object} sessionData - The raw data to populate the model with.
 *
 * @returns {module:SessionModel} A model instance with stubbed methods.
 */
function build(_sinon, sessionData) {
  const session = SessionModel.fromJson({
    id: generateUUID(),
    ...sessionData
  })

  vi.spyOn(session, '$update').mockResolvedValue(session)

  return session
}

export default {
  build
}
