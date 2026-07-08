'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const YarStub = require('../../support/stubs/yar.stub.js')

// Things we need to stub
const DeleteCompanyContactService = require('../../../app/services/company-contacts/delete-company-contact.service.js')
const FetchCompanyContactDal = require('../../../app/dal/company-contacts/fetch-company-contact.dal.js')
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
    Sinon.stub(FetchCompanyContactDal, 'go').resolves(companyContact)

    yarStub = YarStub.build(Sinon)
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
        const result = await SubmitRemoveCompanyContactService(companyContact.id, yarStub)

        expect(result).toEqual({
          companyId: companyContact.companyId
        })
      })

      it('sets a flash message', async () => {
        await SubmitRemoveCompanyContactService(companyContact.id, yarStub)

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({
          text: 'Rachael Tyrell was removed from this company.',
          titleText: 'Contact removed'
        })
      })

      it('calls the delete company contact service with the id and true', async () => {
        await SubmitRemoveCompanyContactService(companyContact.id, yarStub)

        expect(DeleteCompanyContactService.go.calledWithExactly(companyContact.id, true)).toBe(true)
      })
    })

    describe('and there are no notifications', () => {
      beforeEach(() => {
        notification = undefined
        Sinon.stub(FetchNotificationService, 'go').resolves(notification)
      })

      it('returns page data for the view', async () => {
        const result = await SubmitRemoveCompanyContactService(companyContact.id, yarStub)

        expect(result).toEqual({
          companyId: companyContact.companyId
        })
      })

      it('sets a flash message', async () => {
        await SubmitRemoveCompanyContactService(companyContact.id, yarStub)

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({
          text: 'Rachael Tyrell was removed from this company.',
          titleText: 'Contact removed'
        })
      })

      it('calls the delete company contact service with the id and false', async () => {
        await SubmitRemoveCompanyContactService(companyContact.id, yarStub)

        expect(DeleteCompanyContactService.go.calledWithExactly(companyContact.id, false)).toBe(true)
      })
    })
  })
})
