'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModel = require('../../../../app/models/session.model.js')
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')

// Things we need to stub
const FetchCompanyService = require('../../../../app/services/companies/fetch-company.service.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/company-contacts/setup/initiate-session.service.js')

describe('Company Contacts - Setup - Initiate Session service', () => {
  let company

  beforeEach(async () => {
    company = CustomersFixtures.company()

    Sinon.stub(FetchCompanyService, 'go').returns(company)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('creates a new session record with the "company" saved', async () => {
      const result = await InitiateSessionService.go(company.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession).to.equal({
        company,
        createdAt: matchingSession.createdAt,
        data: {
          company
        },
        id: result.id,
        updatedAt: matchingSession.updatedAt
      })
    })
  })
})
