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
const SessionModel = require('../../../../app/models/session.model.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const UpdateCompanyContactService = require('../../../../app/services/company-contacts/setup/update-company-contact.service.js')

// Thing under test
const SubmitRestoreService = require('../../../../app/services/company-contacts/setup/submit-restore.service.js')

describe('Company Contacts - Setup - Restore Service', () => {
  let auth
  let company
  let companyContact
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

    session = await SessionHelper.add({ data: sessionData })

    yarStub = { flash: Sinon.stub() }

    Sinon.stub(UpdateCompanyContactService, 'go').resolves()
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

      const deletedSession = await SessionModel.query().findById(session.id)

      expect(deletedSession).to.be.undefined()
    })

    describe('the "abstractionAlerts" property', () => {
      describe('is "yes"', () => {
        it('persists the "abstractionAlerts" as "true"', async () => {
          await SubmitRestoreService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactService.go.args[0]

          expect(actualContact.abstractionAlerts).to.be.true()
        })
      })

      describe(' is "no"', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData, abstractionAlerts: 'no' } })
        })

        it('persists the "abstractionAlerts" as "false"', async () => {
          await SubmitRestoreService.go(session.id, yarStub, auth)

          const [actualContact] = UpdateCompanyContactService.go.args[0]

          expect(actualContact.abstractionAlerts).to.be.false()
        })
      })
    })

    describe('the "email" property', () => {
      describe('when email is in multi cases', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData, email: 'ERICE@TEST.COM' } })
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
