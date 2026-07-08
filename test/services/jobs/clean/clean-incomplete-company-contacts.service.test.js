'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const LicenceEntityHelper = require('../../../support/helpers/licence-entity.helper.js')
const LicenceRoleHelper = require('../../../support/helpers/licence-role.helper.js')
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const CompanyContactModel = require('../../../../app/models/company-contact.model.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')

// Things we need to stub
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')

// Thing under test
const CleanIncompleteCompanyContactsService = require('../../../../app/services/jobs/clean/clean-incomplete-company-contacts.service.js')

describe('Jobs - Clean - Clean Incomplete Company Contacts service', () => {
  let companyContact
  let contact
  let notifierStub

  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub.build(Sinon)
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(async () => {
    Sinon.restore()
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
      Sinon.stub(CompanyContactModel, 'query').returns({
        delete: Sinon.stub().returnsThis(),
        innerJoinRelated: Sinon.stub().returnsThis(),
        where: Sinon.stub().returnsThis(),
        whereNull: Sinon.stub().rejects()
      })
    })

    it('does not throw an error', async () => {
      await expect(CleanIncompleteCompanyContactsService()).resolves.toBeDefined()
    })

    it('logs the error', async () => {
      await CleanIncompleteCompanyContactsService()

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Clean job failed')).toBe(true)
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
