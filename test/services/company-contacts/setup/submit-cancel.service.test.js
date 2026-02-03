'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitCancelService = require('../../../../app/services/company-contacts/setup/submit-cancel.service.js')

describe('Company Contacts - Setup - Cancel Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('continues the journey', async () => {
      const result = await SubmitCancelService.go(session.id)

      expect(result).to.equal({
        redirectUrl: ''
      })
    })
  })
})
