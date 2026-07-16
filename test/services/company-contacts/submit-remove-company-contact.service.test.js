// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as CustomersFixtures from '../../support/fixtures/customers.fixture.js'
import YarStub from '../../support/stubs/yar.stub.js'

// Things we need to stub
import * as DeleteCompanyContactService from '../../../app/services/company-contacts/delete-company-contact.service.js'
import * as FetchCompanyContactDal from '../../../app/dal/company-contacts/fetch-company-contact.dal.js'
import * as FetchNotificationService from '../../../app/services/company-contacts/fetch-notification.service.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import SubmitRemoveCompanyContactService from '../../../app/services/company-contacts/submit-remove-company-contact.service.js'

describe('Company Contacts - Submit Remove Company Contact Service', () => {
  let companyContact
  let notification
  let yarStub

  beforeEach(() => {
    companyContact = CustomersFixtures.companyContact()

    vi.spyOn(DeleteCompanyContactService, 'default').mockResolvedValue()
    vi.spyOn(FetchCompanyContactDal, 'default').mockResolvedValue(companyContact)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and there are notifications', () => {
      beforeEach(() => {
        notification = { id: generateUUID() }
        vi.spyOn(FetchNotificationService, 'default').mockResolvedValue(notification)
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
        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({
          text: 'Rachael Tyrell was removed from this company.',
          titleText: 'Contact removed'
        })
      })

      it('calls the delete company contact service with the id and true', async () => {
        await SubmitRemoveCompanyContactService(companyContact.id, yarStub)

        expect(DeleteCompanyContactService.default).toHaveBeenCalledWith(companyContact.id, true)
      })
    })

    describe('and there are no notifications', () => {
      beforeEach(() => {
        notification = undefined
        vi.spyOn(FetchNotificationService, 'default').mockResolvedValue(notification)
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
        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({
          text: 'Rachael Tyrell was removed from this company.',
          titleText: 'Contact removed'
        })
      })

      it('calls the delete company contact service with the id and false', async () => {
        await SubmitRemoveCompanyContactService(companyContact.id, yarStub)

        expect(DeleteCompanyContactService.default).toHaveBeenCalledWith(companyContact.id, false)
      })
    })
  })
})
