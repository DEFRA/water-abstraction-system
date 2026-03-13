'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceEntityHelper = require('../../../support/helpers/licence-entity.helper.js')
const LicenceRoleHelper = require('../../../support/helpers/licence-role.helper.js')
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const CompanyContactModel = require('../../../../app/models/company-contact.model.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')

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
    notifierStub = { omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(async () => {
    Sinon.restore()
    delete global.GlobalNotifier

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
          const result = await CleanIncompleteCompanyContactsService.go()

          const existsResults = await CompanyContactModel.query().whereIn('id', [companyContact.id])

          expect(existsResults).to.have.length(0)

          // We can't check the exact count in case the test deletes void return logs created by other tests
          expect(result).to.be.greaterThan(0)
        })
      })

      describe('and it is linked to a company contact with a different role', () => {
        beforeEach(async () => {
          const licenceRole = LicenceRoleHelper.select('licenceHolder')

          companyContact = await CompanyContactHelper.add({ contactId: contact.id, licenceRoleId: licenceRole.id })
        })

        it('does not remove the company contact and returns the count', async () => {
          const result = await CleanIncompleteCompanyContactsService.go()

          const existsResults = await CompanyContactModel.query().whereIn('id', [companyContact.id])

          expect(existsResults).to.have.length(1)

          // Like in the previous tests, we can't check the exact count in case the test deletes other company contacts
          // created by other tests. We just want to check we are always getting a number
          expect(typeof result).to.equal('number')
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
          const result = await CleanIncompleteCompanyContactsService.go()

          const existsResults = await CompanyContactModel.query().whereIn('id', [companyContact.id])

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
      Sinon.stub(CompanyContactModel, 'query').returns({
        delete: Sinon.stub().returnsThis(),
        innerJoinRelated: Sinon.stub().returnsThis(),
        where: Sinon.stub().returnsThis(),
        whereNull: Sinon.stub().rejects()
      })
    })

    it('does not throw an error', async () => {
      await expect(CleanIncompleteCompanyContactsService.go()).not.to.reject()
    })

    it('logs the error', async () => {
      await CleanIncompleteCompanyContactsService.go()

      const errorLogArgs = notifierStub.omfg.firstCall.args

      expect(notifierStub.omfg.calledWith('Clean job failed')).to.be.true()
      expect(errorLogArgs[1]).to.equal({ job: 'clean-incomplete-company-contacts' })
      expect(errorLogArgs[2]).to.be.instanceOf(Error)
    })

    it('still returns a count', async () => {
      const result = await CleanIncompleteCompanyContactsService.go()

      // Like in the previous tests, we can't check the exact count in case the test deletes void return logs created
      // by other tests. We just want to check we are always getting a number
      expect(typeof result).to.equal('number')
    })
  })
})
