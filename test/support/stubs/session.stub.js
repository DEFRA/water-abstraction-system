// Test framework
import { vi } from 'vitest'

import SessionModel from '../../../app/models/session.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

/**
 * Creates a stubbed instance of the SessionModel for testing purposes.
 *
 * @param {object} sessionData - The raw data to populate the model with.
 *
 * @returns {module:SessionModel} A model instance with stubbed methods.
 */
export default function build(sessionData) {
  const session = SessionModel.fromJson({
    id: generateUUID(),
    ...sessionData
  })

  vi.spyOn(session, '$update').mockResolvedValue(session)

  return session
}
