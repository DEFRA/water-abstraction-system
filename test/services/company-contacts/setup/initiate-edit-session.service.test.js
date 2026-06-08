'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModel = require('../../../../app/models/session.model.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const FetchCompanyContactService = require('../../../../app/dal/company-contacts/setup/fetch-company-contact.dal.js')
const FetchCompanyLicencesService = require('../../../../app/dal/company-contacts/fetch-company-licences.dal.js')

// Thing under test
const InitiateEditSessionService = require('../../../../app/services/company-contacts/setup/initiate-edit-session.service.js')

describe('Company Contacts - Setup - Initiate edit Session service', () => {
  let company
  let companyContact
  let contact
  let licences
  let stubFetchCompanyContactService

  beforeEach(() => {
    company = CustomersFixtures.company()
    contact = CustomersFixtures.contact()

    licences = [{ id: generateUUID(), licenceRef: generateLicenceRef() }]

    companyContact = {
      id: generateUUID(),
      abstractionAlerts: false,
      company,
      contact
    }

    stubFetchCompanyContactService = Sinon.stub(FetchCompanyContactService, 'go').returns(companyContact)

    Sinon.stub(FetchCompanyLicencesService, 'go').returns(licences)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('creates a new session record with the "company contact" saved', async () => {
      const result = await InitiateEditSessionService.go(companyContact.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      const expectedSessionData = _expectedSessionData(companyContact, company, contact, licences)

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

        stubFetchCompanyContactService.resolves(companyContact)
      })

      it('converts false to "yes"', async () => {
        const result = await InitiateEditSessionService.go(companyContact.id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.abstractionAlerts).to.equal('yes')
      })
    })

    describe('when the "abstractionAlerts" property is false', () => {
      it('converts false to "no"', async () => {
        const result = await InitiateEditSessionService.go(companyContact.id)

        const matchingSession = await SessionModel.query().findById(result.id)

        expect(matchingSession.abstractionAlerts).to.equal('no')
      })
    })
  })

  describe('the "name" property', () => {
    it('formats the name', async () => {
      const result = await InitiateEditSessionService.go(companyContact.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.name).to.equal('Rachael Tyrell')
    })
  })
})

function _expectedSessionData(companyContact, company, contact, licences) {
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
    licences,
    name: 'Rachael Tyrell'
  }
}
