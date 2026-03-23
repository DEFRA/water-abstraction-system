'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const CreateCompanyContactService = require('../../../../app/services/company-contacts/setup/create-company-contact.service.js')
const UpdateCompanyContactService = require('../../../../app/services/company-contacts/setup/update-company-contact.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/company-contacts/setup/submit-check.service.js')

describe('Company Contacts - Setup - Check Service', () => {
  let auth
  let company
  let companyContact
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    auth = { credentials: { user: { id: generateUUID() } } }

    company = CustomersFixtures.company()

    Sinon.stub(CreateCompanyContactService, 'go').resolves()
    Sinon.stub(UpdateCompanyContactService, 'go').resolves()

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when creating a company contact', () => {
    beforeEach(async () => {
      sessionData = _createSessionData(company)

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService.go(session.id, yarStub, auth)

      expect(result).to.equal({
        redirectUrl: `/system/companies/${company.id}/contacts`
      })
    })

    it('persists the company contact details', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

      const actualContact = CreateCompanyContactService.go.args[0]

      expect(actualContact).to.equal([
        company.id,
        {
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

          const actualContact = CreateCompanyContactService.go.args[0][1]

          expect(actualContact.abstractionAlerts).to.be.true()
        })
      })

      describe(' is "no"', () => {
        beforeEach(async () => {
          sessionData = _createSessionData(company)

          session = await SessionHelper.add({ data: { ...sessionData, abstractionAlerts: 'no' } })
        })

        it('persists the "abstractionAlerts" as "false"', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const actualContact = CreateCompanyContactService.go.args[0][1]

          expect(actualContact.abstractionAlerts).to.be.false()
        })
      })
    })

    describe('the "email" property', () => {
      beforeEach(async () => {
        sessionData = _createSessionData(company)

        session = await SessionHelper.add({ data: { ...sessionData, email: 'ERICE@TEST.COM' } })
      })

      it('persists the "email" in lowercase', async () => {
        await SubmitCheckService.go(session.id, yarStub, auth)

        const actualContact = CreateCompanyContactService.go.args[0][1]

        expect(actualContact.email).to.equal('erice@test.com')
      })
    })
  })

  describe('when updating a company contact', () => {
    beforeEach(async () => {
      companyContact = CustomersFixtures.companyContact()

      sessionData = _updateSessionData(company, companyContact)

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService.go(session.id, yarStub, auth)

      expect(result).to.equal({
        redirectUrl: `/system/company-contacts/${companyContact.id}/contact-details`
      })
    })

    it('persists the company contact details', async () => {
      await SubmitCheckService.go(session.id, yarStub, auth)

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
      await SubmitCheckService.go(session.id, yarStub, auth)

      const [flashType, bannerMessage] = yarStub.flash.args[0]

      expect(flashType).to.equal('notification')
      expect(bannerMessage).to.equal({ titleText: 'Updated', text: `Contact details updated.` })
    })

    describe('the "abstractionAlerts" property', () => {
      describe('is "yes"', () => {
        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactService.go.args[0]

          expect(actualContact.abstractionAlerts).to.be.true()
        })
      })

      describe(' is "no"', () => {
        beforeEach(async () => {
          sessionData = _updateSessionData(company, companyContact)

          session = await SessionHelper.add({ data: { ...sessionData, abstractionAlerts: 'no' } })
        })

        it('persists the "abstractionAlerts" as "false"', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactService.go.args[0]

          expect(actualContact.abstractionAlerts).to.be.false()
        })
      })
    })

    describe('the "email" property', () => {
      describe('when email is in multi cases', () => {
        beforeEach(async () => {
          sessionData = _updateSessionData(company, companyContact)

          session = await SessionHelper.add({ data: { ...sessionData, email: 'ERICE@TEST.COM' } })
        })

        it('persists the "email" in lowercase', async () => {
          await SubmitCheckService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactService.go.args[0]

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
