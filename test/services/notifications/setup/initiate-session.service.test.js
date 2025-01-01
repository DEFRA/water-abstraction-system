'use strict'

// Test framework dependencies
const { describe, it, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/notifications/setup/initiate-session.service.js')

describe('Notifications Setup - Initiate Session service', () => {
  after(async () => {
    await closeConnection()
  })

  describe('when called', () => {
    it('creates a new session record with an empty data property', async () => {
      const result = await InitiateSessionService.go()

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.data).to.equal({})
    })
  })
})
