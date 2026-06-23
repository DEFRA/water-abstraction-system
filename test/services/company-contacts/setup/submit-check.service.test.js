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
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Test helpers
const YarStub = require('../../../support/stubs/yar.stub.js')

// Things we need to stub
const CreateCompanyContactDal = require('../../../../app/dal/company-contacts/setup/create-company-contact.dal.js')
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')
const UpdateCompanyContactDal = require('../../../../app/dal/company-contacts/setup/update-company-contact.dal.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/company-contacts/setup/submit-check.service.js')

describe('Company Contacts - Setup - Check Service', () => {
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

    Sinon.stub(CreateCompanyContactDal, 'go').resolves()
    Sinon.stub(UpdateCompanyContactDal, 'go').resolves()

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when creating a company contact', () => {
    beforeEach(async () => {
      sessionData = _createSessionData(company)

      session = SessionModelStub.build(Sinon, sessionData)

      fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
    })

    it('clears the session', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      const deletedSession = await SessionModel.query().findById(session.id)

      expect(deletedSession).to.be.undefined()
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService.go(session.id, yarStub, auth)

      expect(result).to.equal({
        redirectUrl: `/system/companies/${company.id}/contacts`
      })
    })

    it('persists the company contact details', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      const actualContact = CreateCompanyContactDal.go.args[0]

      expect(actualContact).to.equal([
        company.id,
        {
          abstractionAlertLicences: null,
          abstractionAlerts: true,
          createdBy: auth.credentials.user.id,
          email: 'eric@test.com',
          name: 'Eric'
        }
      ])
    })

    it('sets a notification', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      const [flashType, bannerMessage] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(bannerMessage).to.equal({ titleText: 'Contact added', text: `Eric was added to this company` })
    })

    describe('the "abstractionAlerts" property', () => {
      describe('is "yes"', () => {
        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactDal.go.args[0][1]

          expect(actualContact.abstractionAlerts).to.be.true()
        })
      })

      describe('is "some"', () => {
        beforeEach(() => {
          session = SessionModelStub.build(Sinon, { ...sessionData, abstractionAlerts: 'some' })

          fetchSessionStub.resolves(session)
        })

        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactDal.go.args[0][1]

          expect(actualContact.abstractionAlerts).to.be.true()
        })
      })

      describe('is "no"', () => {
        beforeEach(async () => {
          session = SessionModelStub.build(Sinon, { ...sessionData, abstractionAlerts: 'no' })

          fetchSessionStub.resolves(session)
        })

        it('persists the "abstractionAlerts" as "false"', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactDal.go.args[0][1]

          expect(actualContact.abstractionAlerts).to.be.false()
        })
      })
    })

    describe('the "abstractionAlertLicences" property', () => {
      describe('when "abstractionAlerts" is "some"', () => {
        let abstractionAlertLicences

        beforeEach(() => {
          abstractionAlertLicences = [generateUUID(), generateUUID()]

          session = SessionModelStub.build(Sinon, {
            ...sessionData,
            abstractionAlerts: 'some',
            abstractionAlertLicences
          })

          fetchSessionStub.resolves(session)
        })

        it('persists "abstractionAlertLicences" as a JSON string', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactDal.go.args[0][1]
          const expectedAbstractionAlertLicences = JSON.stringify(abstractionAlertLicences)

          expect(actualContact.abstractionAlertLicences).to.equal(expectedAbstractionAlertLicences)
        })
      })

      describe('when "abstractionAlerts" is not "some"', () => {
        it('persists "abstractionAlertLicences" as null', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactDal.go.args[0][1]

          expect(actualContact.abstractionAlertLicences).to.be.null()
        })
      })
    })

    describe('the "email" property', () => {
      beforeEach(async () => {
        session = SessionModelStub.build(Sinon, { ...sessionData, email: 'ERICE@TEST.COM' })

        fetchSessionStub.resolves(session)
      })

      it('persists the "email" in lowercase', async () => {
        await SubmitCheckService.go(session.id, yarStub, auth)

        const actualContact = CreateCompanyContactDal.go.args[0][1]

        expect(actualContact.email).to.equal('erice@test.com')
      })
    })
  })

  describe('when updating a company contact', () => {
    beforeEach(async () => {
      companyContact = CustomersFixtures.companyContact()

      sessionData = _updateSessionData(company, companyContact)

      session = SessionModelStub.build(Sinon, sessionData)

      fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService.go(session.id, yarStub, auth)

      expect(result).to.equal({
        redirectUrl: `/system/company-contacts/${companyContact.id}/contact-details`
      })
    })

    it('persists the company contact details', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      const [actualContact] = UpdateCompanyContactDal.go.args[0]

      expect(actualContact).to.equal({
        id: companyContact.id,
        abstractionAlertLicences: null,
        abstractionAlerts: true,
        contactId: companyContact.contact.id,
        email: 'eric@test.com',
        name: 'Eric',
        updatedBy: auth.credentials.user.id
      })
    })

    it('sets a notification', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      const [flashType, bannerMessage] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(bannerMessage).to.equal({ titleText: 'Updated', text: `Contact details updated.` })
    })

    describe('the "abstractionAlerts" property', () => {
      describe('is "yes"', () => {
        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.args[0]

          expect(actualContact.abstractionAlerts).to.be.true()
        })
      })

      describe('is "some"', () => {
        beforeEach(() => {
          session = SessionModelStub.build(Sinon, { ...sessionData, abstractionAlerts: 'some' })

          fetchSessionStub.resolves(session)
        })

        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.args[0]

          expect(actualContact.abstractionAlerts).to.be.true()
        })
      })

      describe('is "no"', () => {
        beforeEach(async () => {
          session = SessionModelStub.build(Sinon, { ...sessionData, abstractionAlerts: 'no' })

          fetchSessionStub.resolves(session)
        })

        it('persists the "abstractionAlerts" as "false"', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.args[0]

          expect(actualContact.abstractionAlerts).to.be.false()
        })
      })
    })

    describe('the "abstractionAlertLicences" property', () => {
      describe('when "abstractionAlerts" is "some"', () => {
        let abstractionAlertLicences

        beforeEach(() => {
          abstractionAlertLicences = [generateUUID(), generateUUID()]

          session = SessionModelStub.build(Sinon, {
            ...sessionData,
            abstractionAlerts: 'some',
            abstractionAlertLicences
          })

          fetchSessionStub.resolves(session)
        })

        it('persists "abstractionAlertLicences" as a JSON string', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.args[0]
          const expectedAbstractionAlertLicences = JSON.stringify(abstractionAlertLicences)

          expect(actualContact.abstractionAlertLicences).to.equal(expectedAbstractionAlertLicences)
        })
      })

      describe('when "abstractionAlerts" is not "some"', () => {
        it('persists "abstractionAlertLicences" as null', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.args[0]

          expect(actualContact.abstractionAlertLicences).to.be.null()
        })
      })
    })

    describe('the "email" property', () => {
      describe('when email is in multi cases', () => {
        beforeEach(async () => {
          session = SessionModelStub.build(Sinon, { ...sessionData, email: 'ERICE@TEST.COM' })

          fetchSessionStub.resolves(session)
        })

        it('persists the "email" in lowercase', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactDal.go.args[0]

          expect(actualContact.email).to.equal('erice@test.com')
        })
      })
    })
  })
})

function _createSessionData(company) {
  return {
    abstractionAlerts: 'yes',
    company,
    email: 'eric@test.com',
    name: 'Eric'
  }
}

function _updateSessionData(company, companyContact) {
  return {
    abstractionAlerts: 'yes',
    company,
    companyContact,
    email: 'eric@test.com',
    name: 'Eric'
  }
}
