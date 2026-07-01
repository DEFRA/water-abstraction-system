'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModel = require('../../../../app/models/session.model.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchCompanyLicencesDal = require('../../../../app/dal/company-contacts/fetch-company-licences.dal.js')
const FetchCompanyService = require('../../../../app/dal/companies/fetch-company.dal.js')

// Thing under test
const InitiateSessionService = require('../../../../app/services/company-contacts/setup/initiate-session.service.js')

describe('Company Contacts - Setup - Initiate Session service', () => {
  let company
  let licences

  beforeEach(() => {
    company = CustomersFixtures.company()
    licences = [{ id: generateUUID(), licenceRef: generateLicenceRef() }]

    Sinon.stub(FetchCompanyService, 'go').returns(company)
    Sinon.stub(FetchCompanyLicencesDal, 'go').returns(licences)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('creates a new session record with the "company" saved', async () => {
      const result = await InitiateSessionService.go(company.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession).toEqual({
        company,
        createdAt: matchingSession.createdAt,
        data: {
          company,
          licences
        },
        id: result.id,
        licences,
        updatedAt: matchingSession.updatedAt
      })
    })
  })
})
