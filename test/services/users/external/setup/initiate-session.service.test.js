'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModel = require('../../../../../app/models/session.model.js')
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const InitiateSessionService = require('../../../../../app/services/users/external/setup/initiate-session.service.js')

describe('Users - External - Setup - Initiate Session service', () => {
  let userId

  beforeEach(() => {
    userId = generateUUID()
  })

  describe('when called', () => {
    it('returns the session Id and an initialised data object', async () => {
      const result = await InitiateSessionService.go(userId)

      expect(result).to.equal({
        data: { selectedLicences: [], userId },
        id: result.id,
        selectedLicences: [],
        userId
      })
    })

    it('initiates the session for the journey ', async () => {
      const result = await InitiateSessionService.go(userId)

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.data).to.equal({ selectedLicences: [], userId })
    })
  })
})
