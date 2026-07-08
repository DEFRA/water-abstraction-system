'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const YarStub = require('../../../support/stubs/yar.stub.js')

// Things we need to stub
const DeleteSessionDal = require('../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')
const UpdateCompanyContactDal = require('../../../../app/dal/company-contacts/setup/update-company-contact.dal.js')

// Thing under test
const SubmitRestoreService = require('../../../../app/services/company-contacts/setup/submit-restore.service.js')

describe('Company Contacts - Setup - Submit Restore Service', () => {
  let auth
  let company
  let companyContact
  let fetchSessionStub
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    auth = { credentials: { user: { id: generateUUID() } } }

    company = CustomersFixtures.company()

    companyContact = CustomersFixtures.companyContact()

    sessionData = {
      abstractionAlerts: 'yes',
      company,
      email: 'eric@test.com',
      matchingContact: companyContact,
      name: 'Eric'
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = YarStub.build(Sinon)

    Sinon.stub(UpdateCompanyContactDal, 'go').resolves()
    Sinon.stub(DeleteSessionDal, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('continues the journey', async () => {
      const result = await SubmitRestoreService(session.id, yarStub, auth)

      expect(result).toEqual({ redirectUrl: `/system/companies/${company.id}/contacts` })
    })

    it('persists the company contact details', async () => {
      await SubmitRestoreService(session.id, yarStub, auth)

      const [actualContact] = UpdateCompanyContactDal.go.args[0]

      expect(actualContact).toEqual({
        id: companyContact.id,
        abstractionAlerts: true,
        contactId: companyContact.contact.id,
        email: 'eric@test.com',
        name: 'Eric',
        updatedBy: auth.credentials.user.id
      })
    })

    it('sets a notification', async () => {
      await SubmitRestoreService(session.id, yarStub, auth)

      const [flashType, bannerMessage] = yarStub.flash.args[0]

      expect(flashType).toEqual('notification')
      expect(bannerMessage).toEqual({ titleText: 'Contact restored', text: `${session.name} was restored.` })
    })

    it('clears the session', async () => {
      await SubmitRestoreService(session.id, yarStub, auth)

      expect(DeleteSessionDal.go.calledWith(session.id)).toBe(true)
    })

    describe('the "abstractionAlerts" property', () => {
      describe('when set to "yes"', () => {
        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitRestoreService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.args[0]

          expect(actualContact.abstractionAlerts).toBe(true)
        })
      })

      describe('when set to "no"', () => {
        beforeEach(async () => {
          session = SessionModelStub.build(Sinon, {
            ...sessionData,
            abstractionAlerts: 'no'
          })

          fetchSessionStub.resolves(session)
        })

        it('persists the "abstractionAlerts" as "false"', async () => {
          await SubmitRestoreService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.args[0]

          expect(actualContact.abstractionAlerts).toBe(false)
        })
      })
    })

    describe('the "email" property', () => {
      describe('when email is in uppercase', () => {
        beforeEach(async () => {
          session = SessionModelStub.build(Sinon, {
            ...sessionData,
            email: 'ERICE@TEST.COM'
          })

          fetchSessionStub.resolves(session)
        })

        it('persists the "email" in lowercase', async () => {
          await SubmitRestoreService(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.args[0]

          expect(actualContact.email).toEqual('erice@test.com')
        })
      })
    })
  })
})
