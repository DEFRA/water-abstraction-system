'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CompanyContactModel = require('../../../../app/models/company-contact.model.js')
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModel = require('../../../../app/models/session.model.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchCompanyContactDal = require('../../../../app/dal/company-contacts/setup/fetch-company-contact.dal.js')
const FetchCompanyLicencesDal = require('../../../../app/dal/company-contacts/fetch-company-licences.dal.js')

// Thing under test
const InitiateEditSessionService = require('../../../../app/services/company-contacts/setup/initiate-edit-session.service.js')

describe('Company Contacts - Setup - Initiate edit Session service', () => {
  let company
  let companyContact
  let contact
  let licences
  let stubFetchCompanyLicencesDal

  beforeEach(() => {
    company = CustomersFixtures.company()
    contact = CustomersFixtures.contact()

    licences = [{ id: generateUUID(), licenceRef: generateLicenceRef() }]

    companyContact = CompanyContactModel.fromJson({
      id: generateUUID(),
      abstractionAlerts: false,
      abstractionAlertLicences: null,
      company,
      contact
    })

    Sinon.stub(FetchCompanyContactDal, 'go').resolves(companyContact)
    stubFetchCompanyLicencesDal = Sinon.stub(FetchCompanyLicencesDal, 'go').resolves(licences)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('creates a new session record with the "company contact" saved', async () => {
      const result = await InitiateEditSessionService.go(companyContact.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      const expectedSessionData = _expectedSessionData(companyContact, company, contact, licences)

      expect(matchingSession).toEqual({
        ...expectedSessionData,
        createdAt: matchingSession.createdAt,
        data: expectedSessionData,
        id: result.id,
        updatedAt: matchingSession.updatedAt
      })
    })
  })

  describe('the "abstractionAlerts" property', () => {
    describe('and the company has active licences', () => {
      describe('when the "abstractionAlerts" property is true', () => {
        beforeEach(() => {
          companyContact.abstractionAlerts = true
        })

        it('returns "yes"', async () => {
          const result = await InitiateEditSessionService.go(companyContact.id)

          const matchingSession = await SessionModel.query().findById(result.id)

          expect(matchingSession.abstractionAlerts).toEqual('yes')
        })

        describe('and there are abstraction alert licences', () => {
          beforeEach(() => {
            companyContact.abstractionAlertLicences = [{ id: generateUUID(), licenceRef: generateLicenceRef() }]
          })

          it('returns "some"', async () => {
            const result = await InitiateEditSessionService.go(companyContact.id)

            const matchingSession = await SessionModel.query().findById(result.id)

            expect(matchingSession.abstractionAlerts).toEqual('some')
          })
        })
      })

      describe('when the "abstractionAlerts" property is false', () => {
        it('returns "no"', async () => {
          const result = await InitiateEditSessionService.go(companyContact.id)

          const matchingSession = await SessionModel.query().findById(result.id)

          expect(matchingSession.abstractionAlerts).toEqual('no')
        })
      })
    })

    describe('and the company has no active licences', () => {
      beforeEach(() => {
        stubFetchCompanyLicencesDal.resolves([])
      })

      describe('when the "abstractionAlerts" property is true', () => {
        beforeEach(() => {
          companyContact.abstractionAlerts = true
        })

        it('returns "yes"', async () => {
          const result = await InitiateEditSessionService.go(companyContact.id)

          const matchingSession = await SessionModel.query().findById(result.id)

          expect(matchingSession.abstractionAlerts).toEqual('yes')
        })

        describe('and there are abstraction alert licences', () => {
          beforeEach(() => {
            companyContact.abstractionAlertLicences = [{ id: generateUUID(), licenceRef: generateLicenceRef() }]
          })

          it('returns "no"', async () => {
            const result = await InitiateEditSessionService.go(companyContact.id)

            const matchingSession = await SessionModel.query().findById(result.id)

            expect(matchingSession.abstractionAlerts).toEqual('no')
          })
        })
      })

      describe('when the "abstractionAlerts" property is false', () => {
        it('returns "no"', async () => {
          const result = await InitiateEditSessionService.go(companyContact.id)

          const matchingSession = await SessionModel.query().findById(result.id)

          expect(matchingSession.abstractionAlerts).toEqual('no')
        })
      })
    })
  })

  describe('the "name" property', () => {
    it('formats the name', async () => {
      const result = await InitiateEditSessionService.go(companyContact.id)

      const matchingSession = await SessionModel.query().findById(result.id)

      expect(matchingSession.name).toEqual('Rachael Tyrell')
    })
  })
})

function _expectedSessionData(companyContact, company, contact, licences) {
  return {
    abstractionAlerts: 'no',
    abstractionAlertLicences: null,
    companyContact: {
      abstractionAlerts: false,
      abstractionAlertLicences: null,
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
