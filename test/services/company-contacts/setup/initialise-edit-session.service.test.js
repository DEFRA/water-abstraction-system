'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModel = require('../../../../app/models/session.model.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchCompanyContactService = require('../../../../app/services/company-contacts/setup/fetch-company-contact.service.js')

// Thing under test
const InitiateEditSessionService = require('../../../../app/services/company-contacts/setup/initiate-edit-session.service.js')

describe('Company Contacts - Setup - Initiate edit Session service', () => {
  let company
  let companyContact
  let contact

  beforeEach(async () => {
    company = CustomersFixtures.company()
    contact = CustomersFixtures.contact()

    companyContact = {
      id: generateUUID(),
      abstractionAlerts: false,
      company,
      contact
    }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      Sinon.stub(FetchCompanyContactService, 'go').returns(companyContact)
    })

    it('creates a new session record with the "company contact" saved', async () => {
      const result = await InitiateEditSessionService.go(companyContact.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      const expectedSessionData = _expectedSessionData(companyContact, company, contact)

      expect(matchingSession).to.equal({
        ...expectedSessionData,
        createdAt: matchingSession.createdAt,
        data: expectedSessionData,
        id: result.id,
        updatedAt: matchingSession.updatedAt
      })
    })
  })

  describe('the "abstractionAlerts" property', () => {
    describe('when the "abstractionAlerts" property is true', () => {
      beforeEach(() => {
        companyContact.abstractionAlerts = true

        Sinon.stub(FetchCompanyContactService, 'go').returns(companyContact)
      })

      it('converts false to "yes"', async () => {
        const result = await InitiateEditSessionService.go(companyContact.id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.abstractionAlerts).to.equal('yes')
      })
    })

    describe('when the "abstractionAlerts" property is false', () => {
      beforeEach(() => {
        Sinon.stub(FetchCompanyContactService, 'go').returns(companyContact)
      })

      it('converts false to "no"', async () => {
        const result = await InitiateEditSessionService.go(companyContact.id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.abstractionAlerts).to.equal('no')
      })
    })
  })

  describe('the "name" property', () => {
    beforeEach(() => {
      Sinon.stub(FetchCompanyContactService, 'go').returns(companyContact)
    })

    it('formats the name', async () => {
      const result = await InitiateEditSessionService.go(companyContact.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.name).to.equal('Rachael Tyrell')
    })
  })
})

function _expectedSessionData(companyContact, company, contact) {
  return {
    abstractionAlerts: 'no',
    companyContact: {
      abstractionAlerts: false,
      company: {
        id: company.id,
        name: 'Tyrell Corporation'
      },
      contact,
      id: companyContact.id
    },
    company,
    email: 'rachael.tyrell@tyrellcorp.com',
    name: 'Rachael Tyrell'
  }
}
