'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const DeleteSessionDal = require('../../../../app/dal/delete-session.dal.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')
const UpdateCompanyContactService = require('../../../../app/services/company-contacts/setup/update-company-contact.service.js')

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

    yarStub = { flash: Sinon.stub() }

    Sinon.stub(UpdateCompanyContactService, 'go').resolves()
    Sinon.stub(DeleteSessionDal, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('continues the journey', async () => {
      const result = await SubmitRestoreService.go(session.id, yarStub, auth)

      expect(result).to.equal({ redirectUrl: `/system/companies/${company.id}/contacts` })
    })

    it('persists the company contact details', async () => {
      await SubmitRestoreService.go(session.id, yarStub, auth)

      const [actualContact] = UpdateCompanyContactService.go.args[0]

      expect(actualContact).to.equal({
        id: companyContact.id,
        abstractionAlerts: true,
        contactId: companyContact.contact.id,
        email: 'eric@test.com',
        name: 'Eric',
        updatedBy: auth.credentials.user.id
      })
    })

    it('sets a notification', async () => {
      await SubmitRestoreService.go(session.id, yarStub, auth)

      const [flashType, bannerMessage] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(bannerMessage).to.equal({ titleText: 'Contact restored', text: `${session.name} was restored.` })
    })

    it('clears the session', async () => {
      await SubmitRestoreService.go(session.id, yarStub, auth)

      expect(DeleteSessionDal.go.calledWith(session.id)).to.be.true()
    })

    describe('the "abstractionAlerts" property', () => {
      describe('when set to "yes"', () => {
        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitRestoreService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactService.go.args[0]

          expect(actualContact.abstractionAlerts).to.be.true()
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
          await SubmitRestoreService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactService.go.args[0]

          expect(actualContact.abstractionAlerts).to.be.false()
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
          await SubmitRestoreService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactService.go.args[0]

          expect(actualContact.email).to.equal('erice@test.com')
        })
      })
    })
  })
})
