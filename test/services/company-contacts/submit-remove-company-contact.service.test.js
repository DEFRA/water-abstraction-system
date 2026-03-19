'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')

// Things we need to stub
const DeleteCompanyContactService = require('../../../app/services/company-contacts/delete-company-contact.service.js')
const FetchCompanyContactService = require('../../../app/services/company-contacts/fetch-company-contact.service.js')
const FetchNotificationService = require('../../../app/services/company-contacts/fetch-notification.service.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const SubmitRemoveCompanyContactService = require('../../../app/services/company-contacts/submit-remove-company-contact.service.js')

describe('Company Contacts - Submit Remove Company Contact Service', () => {
  let companyContact
  let notification
  let yarStub

  beforeEach(() => {
    companyContact = CustomersFixtures.companyContact()

    Sinon.stub(DeleteCompanyContactService, 'go').resolves()
    Sinon.stub(FetchCompanyContactService, 'go').resolves(companyContact)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and there are notifications', () => {
      beforeEach(() => {
        notification = { id: generateUUID() }
        Sinon.stub(FetchNotificationService, 'go').resolves(notification)
      })

      it('returns page data for the view', async () => {
        const result = await SubmitRemoveCompanyContactService.go(companyContact.id, yarStub)

        expect(result).to.equal({
          companyId: companyContact.companyId
        })
      })

      it('sets a flash message', async () => {
        await SubmitRemoveCompanyContactService.go(companyContact.id, yarStub)

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(bannerMessage).to.equal({
          text: 'Rachael Tyrell was removed from this company.',
          titleText: 'Contact removed'
        })
      })

      it('calls the delete company contact service with the id and true', async () => {
        await SubmitRemoveCompanyContactService.go(companyContact.id, yarStub)

        expect(DeleteCompanyContactService.go.calledWithExactly(companyContact.id, true)).to.be.true()
      })
    })

    describe('and there are no notifications', () => {
      beforeEach(() => {
        notification = undefined
        Sinon.stub(FetchNotificationService, 'go').resolves(notification)
      })

      it('returns page data for the view', async () => {
        const result = await SubmitRemoveCompanyContactService.go(companyContact.id, yarStub)

        expect(result).to.equal({
          companyId: companyContact.companyId
        })
      })

      it('sets a flash message', async () => {
        await SubmitRemoveCompanyContactService.go(companyContact.id, yarStub)

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(bannerMessage).to.equal({
          text: 'Rachael Tyrell was removed from this company.',
          titleText: 'Contact removed'
        })
      })

      it('calls the delete company contact service with the id and false', async () => {
        await SubmitRemoveCompanyContactService.go(companyContact.id, yarStub)

        expect(DeleteCompanyContactService.go.calledWithExactly(companyContact.id, false)).to.be.true()
      })
    })
  })
})
