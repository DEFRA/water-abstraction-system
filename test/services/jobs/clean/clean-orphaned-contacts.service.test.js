// Test helpers
import BillingAccountAddressHelper from '../../../support/helpers/billing-account-address.helper.js'
import CompanyContactHelper from '../../../support/helpers/company-contact.helper.js'
import ContactHelper from '../../../support/helpers/contact.helper.js'
import ContactModel from '../../../../app/models/contact.model.js'
import LicenceDocumentRoleHelper from '../../../support/helpers/licence-document-role.helper.js'

// Things we need to stub
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import CleanOrphanedContactsService from '../../../../app/services/jobs/clean/clean-orphaned-contacts.service.js'

describe('Jobs - Clean - Clean Orphaned Contacts service', () => {
  let billingAccountAddress
  let companyContact
  let contact
  let licenceDocumentRole
  let notifierStub

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier

    await contact.$query().delete()

    if (companyContact) {
      await companyContact.$query().delete()
    }

    if (billingAccountAddress) {
      await billingAccountAddress.$query().delete()
    }

    if (licenceDocumentRole) {
      await licenceDocumentRole.$query().delete()
    }
  })

  describe('when the clean is successful', () => {
    beforeEach(async () => {
      contact = await ContactHelper.add()
    })

    describe('and the contact is "orphaned"', () => {
      it('removes the contact and returns the count', async () => {
        const result = await CleanOrphanedContactsService()

        const existsResults = await ContactModel.query().whereIn('id', [contact.id])

        expect(existsResults).toHaveLength(0)

        // We can't check the exact count in case the test deletes void return logs created by other tests
        expect(result).toBeGreaterThan(0)
      })
    })

    describe('and the contact is not "orphaned"', () => {
      describe('because it is linked to a "billing account address"', () => {
        beforeEach(async () => {
          billingAccountAddress = await BillingAccountAddressHelper.add({ contactId: contact.id })
        })

        it('does not remove the contact and returns the count', async () => {
          const result = await CleanOrphanedContactsService()

          const existsResults = await ContactModel.query().whereIn('id', [contact.id])

          expect(existsResults).toHaveLength(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes other company contacts
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).toEqual('number')
        })
      })

      describe('because it is linked to a "company contact"', () => {
        beforeEach(async () => {
          companyContact = await CompanyContactHelper.add({ contactId: contact.id })
        })

        it('does not remove the contact and returns the count', async () => {
          const result = await CleanOrphanedContactsService()

          const existsResults = await ContactModel.query().whereIn('id', [contact.id])

          expect(existsResults).toHaveLength(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes other company contacts
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).toEqual('number')
        })
      })

      describe('because it is linked to a "licence document role"', () => {
        beforeEach(async () => {
          licenceDocumentRole = await LicenceDocumentRoleHelper.add({ contactId: contact.id })
        })

        it('does not remove the contact and returns the count', async () => {
          const result = await CleanOrphanedContactsService()

          const existsResults = await ContactModel.query().whereIn('id', [contact.id])

          expect(existsResults).toHaveLength(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes other company contacts
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).toEqual('number')
        })
      })

      describe('because it is linked to multiple entities', () => {
        beforeEach(async () => {
          billingAccountAddress = await BillingAccountAddressHelper.add({ contactId: contact.id })
          companyContact = await CompanyContactHelper.add({ contactId: contact.id })
          licenceDocumentRole = await LicenceDocumentRoleHelper.add({ contactId: contact.id })
        })

        it('does not remove the contact and returns the count', async () => {
          const result = await CleanOrphanedContactsService()

          const existsResults = await ContactModel.query().whereIn('id', [contact.id])

          expect(existsResults).toHaveLength(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes other company contacts
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).toEqual('number')
        })
      })
    })
  })

  describe('when the clean errors', () => {
    beforeEach(() => {
      vi.spyOn(ContactModel, 'query').mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        whereRaw: vi.fn().mockRejectedValue(new Error())
      })
    })

    it('does not throw an error', async () => {
      await expect(CleanOrphanedContactsService()).resolves.toBeDefined()
    })

    it('logs the error', async () => {
      await CleanOrphanedContactsService()

      const errorLogArgs = notifierStub.omfg.mock.calls[0]

      expect(notifierStub.omfg).toHaveBeenCalledWith('Clean job failed', expect.any(Object), expect.any(Error))
      expect(errorLogArgs[1]).toEqual({ job: 'clean-orphaned-contacts' })
      expect(errorLogArgs[2]).toBeInstanceOf(Error)
    })

    it('still returns a count', async () => {
      const result = await CleanOrphanedContactsService()

      // Like in the previous tests, we can't check the exact count in case the test deletes void return logs created
      // by other tests. We just want to check we are always getting a number
      expect(typeof result).toEqual('number')
    })
  })
})
