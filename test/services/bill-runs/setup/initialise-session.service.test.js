'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../../support/database.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/bill-runs/setup/initiate-session.service.js')

describe('Bill Run Initiate Session service', () => {
  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when called', () => {
    it('creates a new session record with an empty data property', async () => {
      const result = await InitiateSessionService.go()

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.data).to.equal({})
    })
  })
})
