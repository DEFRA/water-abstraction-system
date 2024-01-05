'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const SessionModel = require('../../../app/models/session.model.js')

// Thing under test
const InitiateReturnRequirementSessionService = require('../../../app/services/return-requirements/initiate-return-requirement-session.service.js')

describe('Initiate Return Requirement Session service', () => {
  const licenceId = '3267ad26-eecc-4b04-bdd9-174239f3c0d2'

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when called', () => {
    it('creates a new session record containing details of the licence', async () => {
      const result = await InitiateReturnRequirementSessionService.go(licenceId)

      const newSession = await SessionModel.query().findById(result)

      expect(newSession).to.exist()
      expect(newSession.data.licenceId).to.equal(licenceId)
    })
  })
})
