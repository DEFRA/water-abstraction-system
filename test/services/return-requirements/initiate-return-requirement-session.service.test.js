'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/company.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHelper = require('../../support/helpers/licence-document.helper.js')
const LicenceDocumentRoleHelper = require('../../support/helpers/licence-document-role.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')

// Thing under test
const InitiateReturnRequirementSessionService = require('../../../app/services/return-requirements/initiate-return-requirement-session.service.js')

describe('Initiate Return Requirement Session service', () => {
  let journey
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when called', () => {
    describe('and the licence exists', () => {
      const licenceRoles = {}

      let company
      let contact
      let licenceDocument

      beforeEach(async () => {
        // Create the licence record with an 'end' date so we can confirm the session gets populated with the licence's
        // 'ends' information
        licence = await LicenceHelper.add({ expiredDate: new Date('2024-08-10') })

        // Create 2 licence versions so we can test the service only gets the 'current' version
        await LicenceVersionHelper.add({
          licenceId: licence.id, startDate: new Date('2021-10-11'), status: 'superseded'
        })
        await LicenceVersionHelper.add({
          licenceId: licence.id, startDate: new Date('2022-05-01')
        })

        // Create 2 licence roles so we can test the service only gets the licence document role record that is for
        // 'licence holder'
        licenceRoles.billing = await LicenceRoleHelper.add({ name: 'billing', label: 'Billing' })
        licenceRoles.holder = await LicenceRoleHelper.add()

        // Create company and contact records. We create an additional company so we can create 2 licence document role
        // records for our licence to test the one with the latest start date is used.
        company = await CompanyHelper.add({ name: 'Licence Holder Ltd' })
        contact = await ContactHelper.add({ firstName: 'Luce', lastName: 'Holder' })
        const oldCompany = await CompanyHelper.add({ name: 'Old Licence Holder Ltd' })

        // We have to create a licence document to link our licence record to (eventually!) the company or contact
        // record that is the 'licence holder'
        licenceDocument = await LicenceDocumentHelper.add({ licenceRef: licence.licenceRef })

        // Create two licence document role records. This one is linked to the billing role so should be ignored by the
        // service
        await LicenceDocumentRoleHelper.add({
          licenceDocumentId: licenceDocument.id,
          licenceRoleId: licenceRoles.billing.id
        })

        // This one is linked to the old company record so should not be used to provide the licence holder name
        await LicenceDocumentRoleHelper.add({
          licenceDocumentId: licenceDocument.id,
          licenceRoleId: licenceRoles.holder.id,
          company: oldCompany.id,
          startDate: new Date('2022-01-01')
        })
      })

      describe('and the licence holder is a company', () => {
        beforeEach(async () => {
          // Create the licence document role record that _is_ linked to the correct licence holder record
          await LicenceDocumentRoleHelper.add({
            licenceDocumentId: licenceDocument.id,
            licenceRoleId: licenceRoles.holder.id,
            companyId: company.id,
            startDate: new Date('2022-08-01')
          })

          journey = 'returns-required'
        })

        it('creates a new session record containing details of the licence and licence holder (company)', async () => {
          const result = await InitiateReturnRequirementSessionService.go(licence.id, journey)

          const { data } = result

          expect(data.licence.id).to.equal(licence.id)
          expect(data.licence.licenceRef).to.equal(licence.licenceRef)
          expect(data.licence.licenceHolder).to.equal('Licence Holder Ltd')
        })

        it("creates a new session record containing the licence's 'current' start date", async () => {
          const result = await InitiateReturnRequirementSessionService.go(licence.id, journey)

          const { data } = result

          expect(data.licence.startDate).to.equal(new Date('2022-05-01'))
        })

        it("creates a new session record containing the licence's end date", async () => {
          const result = await InitiateReturnRequirementSessionService.go(licence.id, journey)

          const { data } = result

          expect(data.licence.endDate).to.equal(new Date('2024-08-10'))
        })

        it('creates a new session record containing the journey passed in', async () => {
          const result = await InitiateReturnRequirementSessionService.go(licence.id, journey)

          const { data } = result

          expect(data.journey).to.equal(journey)
        })
      })

      describe('and the licence holder is a contact', () => {
        beforeEach(async () => {
          // Create the licence document role record that _is_ linked to the correct licence holder record.
          // NOTE: We create this against both the company and contact to also confirm that the contact name has
          // precedence over the company name
          await LicenceDocumentRoleHelper.add({
            licenceDocumentId: licenceDocument.id,
            licenceRoleId: licenceRoles.holder.id,
            companyId: company.id,
            contactId: contact.id,
            startDate: new Date('2022-08-01')
          })

          journey = 'no-returns-required'
        })

        it('creates a new session record containing details of the licence and licence holder (contact)', async () => {
          const result = await InitiateReturnRequirementSessionService.go(licence.id, journey)

          const { data } = result

          expect(data.licence.id).to.equal(licence.id)
          expect(data.licence.licenceRef).to.equal(licence.licenceRef)
          expect(data.licence.licenceHolder).to.equal('Luce Holder')
        })

        it("creates a new session record containing the licence's 'current' start date", async () => {
          const result = await InitiateReturnRequirementSessionService.go(licence.id, journey)

          const { data } = result

          expect(data.licence.startDate).to.equal(new Date('2022-05-01'))
        })

        it("creates a new session record containing the licence's end date", async () => {
          const result = await InitiateReturnRequirementSessionService.go(licence.id, journey)

          const { data } = result

          expect(data.licence.endDate).to.equal(new Date('2024-08-10'))
        })

        it('creates a new session record containing the journey passed in', async () => {
          const result = await InitiateReturnRequirementSessionService.go(licence.id, journey)

          const { data } = result

          expect(data.journey).to.equal(journey)
        })
      })
    })

    describe('but the licence does not exist', () => {
      it('throws a Boom not found error', async () => {
        const error = await expect(InitiateReturnRequirementSessionService.go('e456e538-4d55-4552-84f7-6a7636eb1945', 'journey')).to.reject()

        expect(error.isBoom).to.be.true()
        expect(error.data).to.equal({ id: 'e456e538-4d55-4552-84f7-6a7636eb1945' })

        const { statusCode, error: errorType, message } = error.output.payload

        expect(statusCode).to.equal(404)
        expect(errorType).to.equal('Not Found')
        expect(message).to.equal('Licence for new return requirement not found')
      })
    })
  })
})
