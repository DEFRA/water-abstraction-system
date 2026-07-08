// Test helpers
import SessionModel from '../../../../../app/models/session.model.js'

// Thing under test
import InitiateSessionService from '../../../../../app/services/users/internal/setup/initiate-session.service.js'

describe('Users - Internal - Setup - Initiate Session service', () => {
  describe('when called', () => {
    it('returns the session Id and an empty data object', async () => {
      const result = await InitiateSessionService()

      expect(result).toEqual({
        data: {},
        id: result.id
      })
    })

    it('initiates the session for the journey ', async () => {
      const result = await InitiateSessionService()

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.data).toEqual({})
    })
  })
})
