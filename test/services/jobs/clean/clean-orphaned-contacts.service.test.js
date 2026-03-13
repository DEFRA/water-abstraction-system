'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillingAccountAddressHelper = require('../../../support/helpers/billing-account-address.helper.js')
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')
const ContactModel = require('../../../../app/models/contact.model.js')
const LicenceDocumentRoleHelper = require('../../../support/helpers/licence-document-role.helper.js')

// Thing under test
const CleanOrphanedContactsService = require('../../../../app/services/jobs/clean/clean-orphaned-contacts.service.js')

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
    notifierStub = { omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(async () => {
    Sinon.restore()
    delete global.GlobalNotifier

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
        const result = await CleanOrphanedContactsService.go()

        const existsResults = await ContactModel.query().whereIn('id', [contact.id])

        expect(existsResults).to.have.length(0)

        // We can't check the exact count in case the test deletes void return logs created by other tests
        expect(result).to.be.greaterThan(0)
      })
    })

    describe('and the contact is not "orphaned"', () => {
      describe('because it is linked to a "billing account address"', () => {
        beforeEach(async () => {
          billingAccountAddress = await BillingAccountAddressHelper.add({ contactId: contact.id })
        })

        it('does not remove the contact and returns the count', async () => {
          const result = await CleanOrphanedContactsService.go()

          const existsResults = await ContactModel.query().whereIn('id', [contact.id])

          expect(existsResults).to.have.length(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes other company contacts
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).to.equal('number')
        })
      })

      describe('because it is linked to a "company contact"', () => {
        beforeEach(async () => {
          companyContact = await CompanyContactHelper.add({ contactId: contact.id })
        })

        it('does not remove the contact and returns the count', async () => {
          const result = await CleanOrphanedContactsService.go()

          const existsResults = await ContactModel.query().whereIn('id', [contact.id])

          expect(existsResults).to.have.length(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes other company contacts
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).to.equal('number')
        })
      })

      describe('because it is linked to a "licence document role"', () => {
        beforeEach(async () => {
          licenceDocumentRole = await LicenceDocumentRoleHelper.add({ contactId: contact.id })
        })

        it('does not remove the contact and returns the count', async () => {
          const result = await CleanOrphanedContactsService.go()

          const existsResults = await ContactModel.query().whereIn('id', [contact.id])

          expect(existsResults).to.have.length(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes other company contacts
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).to.equal('number')
        })
      })

      describe('because it is linked to multiple entities', () => {
        beforeEach(async () => {
          billingAccountAddress = await BillingAccountAddressHelper.add({ contactId: contact.id })
          companyContact = await CompanyContactHelper.add({ contactId: contact.id })
          licenceDocumentRole = await LicenceDocumentRoleHelper.add({ contactId: contact.id })
        })

        it('does not remove the contact and returns the count', async () => {
          const result = await CleanOrphanedContactsService.go()

          const existsResults = await ContactModel.query().whereIn('id', [contact.id])

          expect(existsResults).to.have.length(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes other company contacts
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).to.equal('number')
        })
      })
    })
  })

  describe('when the clean errors', () => {
    beforeEach(() => {
      Sinon.stub(ContactModel, 'query').returns({
        delete: Sinon.stub().returnsThis(),
        whereRaw: Sinon.stub().rejects()
      })
    })

    it('does not throw an error', async () => {
      await expect(CleanOrphanedContactsService.go()).not.to.reject()
    })

    it('logs the error', async () => {
      await CleanOrphanedContactsService.go()

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Clean job failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal({ job: 'clean-orphaned-contacts' })
      expect(errorLogArgs[2]).to.be.instanceOf(Error)
    })

    it('still returns a count', async () => {
      const result = await CleanOrphanedContactsService.go()

      // Like in the previous tests, we can't check the exact count in case the test deletes void return logs created
      // by other tests. We just want to check we are always getting a number
      expect(typeof result).to.equal('number')
    })
  })
})
