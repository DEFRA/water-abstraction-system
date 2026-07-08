// Test helpers
import SessionModel from '../../../../app/models/session.model.js'

// Thing under test
import InitiateSessionService from '../../../../app/services/bill-runs/setup/initiate-session.service.js'

describe('Bill Run - Setup - Initiate Session service', () => {
  describe('when called', () => {
    it('creates a new session record with an empty data property', async () => {
      const result = await InitiateSessionService()

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.data).toEqual({})
    })
  })
})
