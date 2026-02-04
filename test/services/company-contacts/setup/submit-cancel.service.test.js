'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const SubmitCancelService = require('../../../../app/services/company-contacts/setup/submit-cancel.service.js')

describe('Company Contacts - Setup - Cancel Service', () => {
  let company
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('continues the journey', async () => {
      const result = await SubmitCancelService.go(session.id)

      expect(result).to.equal({
        redirectUrl: `/system/companies/${company.id}/contacts`
      })
    })

    it('clears the session', async () => {
      await SubmitCancelService.go(session.id)

      const noSession = await SessionModel.query().where('id', session.id)

      expect(noSession).to.equal([])
    })
  })
})
