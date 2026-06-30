'use strict'

// Test helpers
const SessionModel = require('../../../../../app/models/session.model.js')

// Thing under test
const InitiateSessionService = require('../../../../../app/services/users/internal/setup/initiate-session.service.js')

describe('Users - Internal - Setup - Initiate Session service', () => {
  describe('when called', () => {
    it('returns the session Id and an empty data object', async () => {
      const result = await InitiateSessionService.go()

      expect(result).toEqual({
        data: {},
        id: result.id
      })
    })

    it('initiates the session for the journey ', async () => {
      const result = await InitiateSessionService.go()

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.data).toEqual({})
    })
  })
})
