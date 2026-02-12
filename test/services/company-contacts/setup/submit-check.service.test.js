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

describe.only('Company Contacts - Setup - Check Service', () => {
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
      sessionData = {
        company,
        name: 'Eric',
        email: 'eric@test.com',
        abstractionAlerts: 'yes'
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns the company id', async () => {
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
  })

  describe('when updating a company contact', () => {
    beforeEach(async () => {
      companyContact = CustomersFixtures.companyContact()

      sessionData = {
        abstractionAlerts: 'yes',
        company,
        companyContact,
        email: 'eric@test.com',
        name: 'Eric'
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns the company id', async () => {
      const result = await SubmitCheckService.go(session.id, yarStub, auth)

      expect(result).to.equal({
        redirectUrl: `/system/company-contacts/${companyContact.id}`
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
  })

  describe('when formatting the company contact', () => {
    beforeEach(async () => {
      sessionData = {
        company,
        name: 'Eric',
        email: 'eric@test.com',
        abstractionAlerts: 'yes'
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    describe('and "abstractionAlerts" is "yes"', () => {
      it('persists the "abstractionAlerts" as "true', async () => {
        await SubmitCheckService.go(session.id, yarStub, auth)

        const actualContact = CreateCompanyContactService.go.args[0][1]

        expect(actualContact.abstractionAlerts).to.be.true()
      })
    })

    describe('and "abstractionAlerts" is "no"', () => {
      beforeEach(async () => {
        sessionData = {
          company,
          name: 'Eric',
          email: 'eric@test.com',
          abstractionAlerts: 'no'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('persists the "abstractionAlerts" as "false', async () => {
        await SubmitCheckService.go(session.id, yarStub, auth)

        const actualContact = CreateCompanyContactService.go.args[0][1]

        expect(actualContact.abstractionAlerts).to.be.false()
      })
    })
  })
})
