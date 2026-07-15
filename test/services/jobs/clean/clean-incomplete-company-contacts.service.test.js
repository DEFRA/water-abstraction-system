// Test helpers
import * as CompanyContactHelper from '../../../support/helpers/company-contact.helper.js'
import * as ContactHelper from '../../../support/helpers/contact.helper.js'
import * as LicenceEntityHelper from '../../../support/helpers/licence-entity.helper.js'
import * as LicenceRoleHelper from '../../../support/helpers/licence-role.helper.js'
import CompanyContactModel from '../../../../app/models/company-contact.model.js'

// Things we need to stub
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'

// Thing under test
import CleanIncompleteCompanyContactsService from '../../../../app/services/jobs/clean/clean-incomplete-company-contacts.service.js'

describe('Jobs - Clean - Clean Incomplete Company Contacts service', () => {
  let companyContact
  let contact
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
    await companyContact.$query().delete()
  })

  describe('when the clean is successful', () => {
    describe('there is a contact with a NULL email address', () => {
      beforeEach(async () => {
        contact = await ContactHelper.add({ email: null })
      })

      describe('and it is linked to a company contact with the "additionalContact" role', () => {
        beforeEach(async () => {
          const licenceRole = LicenceRoleHelper.select('additionalContact')

          companyContact = await CompanyContactHelper.add({ contactId: contact.id, licenceRoleId: licenceRole.id })
        })

        it('removes the company contact and returns the count', async () => {
          const result = await CleanIncompleteCompanyContactsService()

          const existsResults = await CompanyContactModel.query().whereIn('id', [companyContact.id])

          expect(existsResults).toHaveLength(0)

          // We can't check the exact count in case the test deletes void return logs created by other tests
          expect(result).toBeGreaterThan(0)
        })
      })

      describe('and it is linked to a company contact with a different role', () => {
        beforeEach(async () => {
          const licenceRole = LicenceRoleHelper.select('licenceHolder')

          companyContact = await CompanyContactHelper.add({ contactId: contact.id, licenceRoleId: licenceRole.id })
        })

        it('does not remove the company contact and returns the count', async () => {
          const result = await CleanIncompleteCompanyContactsService()

          const existsResults = await CompanyContactModel.query().whereIn('id', [companyContact.id])

          expect(existsResults).toHaveLength(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes other company contacts
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).toEqual('number')
        })
      })
    })

    describe('there is a contact with a populated email address', () => {
      beforeEach(async () => {
        contact = await ContactHelper.add({ email: LicenceEntityHelper.generateName() })
      })

      describe('and it is linked to a company contact with the "additionalContact" role', () => {
        beforeEach(async () => {
          const licenceRole = LicenceRoleHelper.select('additionalContact')

          companyContact = await CompanyContactHelper.add({ contactId: contact.id, licenceRoleId: licenceRole.id })
        })

        it('does not remove the company contact and returns the count', async () => {
          const result = await CleanIncompleteCompanyContactsService()

          const existsResults = await CompanyContactModel.query().whereIn('id', [companyContact.id])

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
      vi.spyOn(CompanyContactModel, 'query').mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        innerJoinRelated: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        whereNull: vi.fn().mockRejectedValue(new Error())
      })
    })

    it('does not throw an error', async () => {
      await expect(CleanIncompleteCompanyContactsService()).resolves.toBeDefined()
    })

    it('logs the error', async () => {
      await CleanIncompleteCompanyContactsService()

      const errorLogArgs = notifierStub.omfg.mock.calls[0]

      expect(notifierStub.omfg).toHaveBeenCalledWith('Clean job failed', expect.any(Object), expect.any(Error))
      expect(errorLogArgs[1]).toEqual({ job: 'clean-incomplete-company-contacts' })
      expect(errorLogArgs[2]).toBeInstanceOf(Error)
    })

    it('still returns a count', async () => {
      const result = await CleanIncompleteCompanyContactsService()

      // Like in the previous tests, we can't check the exact count in case the test deletes void return logs created
      // by other tests. We just want to check we are always getting a number
      expect(typeof result).toEqual('number')
    })
  })
})
