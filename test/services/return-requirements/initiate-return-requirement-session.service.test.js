'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const SessionModel = require('../../../app/models/session.model.js')

// Thing under test
const InitiateReturnRequirementSessionService = require('../../../app/services/return-requirements/initiate-return-requirement-session.service.js')

describe('Initiate Return Requirement Session service', () => {
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when called', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('creates a new session record containing details of the licence', async () => {
      const result = await InitiateReturnRequirementSessionService.go(licence.id)

      const session = await SessionModel.query().findById(result)
      const { data } = session

      expect(data.licence.licenceId).to.equal(licence.id)
      expect(data.licence.licenceRef).to.equal(licence.licenceRef)
    })
  })
})
