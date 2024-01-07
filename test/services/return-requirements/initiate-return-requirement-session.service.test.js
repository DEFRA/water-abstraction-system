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
const SessionModel = require('../../../app/models/session.model.js')

// Thing under test
const InitiateReturnRequirementSessionService = require('../../../app/services/return-requirements/initiate-return-requirement-session.service.js')

describe('Initiate Return Requirement Session service', () => {
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
        licence = await LicenceHelper.add()

        // Create 2 licence roles so we can test the service only gets the licence document role record that is for
        // 'licence holder'
        licenceRoles.billing = await LicenceRoleHelper.add({ name: 'billing', label: 'Billing' })
        licenceRoles.holder = await LicenceRoleHelper.add()

        // Create a company and contact record
        company = await CompanyHelper.add({ name: 'Licence Holder Ltd' })
        contact = await ContactHelper.add({ firstName: 'Luce', lastName: 'Holder' })

        // We have to create a licence document to link our licence record to (eventually!) the company or contact
        // record that is the 'licence holder'
        licenceDocument = await LicenceDocumentHelper.add({ licenceRef: licence.licenceRef })

        // Create a licence document role record. This one is linked to the billing role so should be ignored by the
        // service
        await LicenceDocumentRoleHelper.add({
          licenceDocumentId: licenceDocument.id,
          licenceRoleId: licenceRoles.billing.id
        })
      })

      describe('and the licence holder is a company', () => {
        beforeEach(async () => {
          // Create the licence document role record that _is_ linked to the licence holder records
          await LicenceDocumentRoleHelper.add({
            licenceDocumentId: licenceDocument.id,
            licenceRoleId: licenceRoles.holder.id,
            companyId: company.id
          })
        })

        it('creates a new session record containing details of the licence and licence holder (company)', async () => {
          const result = await InitiateReturnRequirementSessionService.go(licence.id)

          const session = await SessionModel.query().findById(result)
          const { data } = session

          expect(data.licence.id).to.equal(licence.id)
          expect(data.licence.licenceRef).to.equal(licence.licenceRef)
          expect(data.licence.licenceHolder).to.equal('Licence Holder Ltd')
        })
      })

      describe('and the licence holder is a contact', () => {
        beforeEach(async () => {
          // Create the licence document role record that _is_ linked to the licence holder records
          await LicenceDocumentRoleHelper.add({
            licenceDocumentId: licenceDocument.id,
            licenceRoleId: licenceRoles.holder.id,
            companyId: company.id,
            contactId: contact.id
          })
        })

        it('creates a new session record containing details of the licence and licence holder (contact)', async () => {
          const result = await InitiateReturnRequirementSessionService.go(licence.id)

          const session = await SessionModel.query().findById(result)
          const { data } = session

          expect(data.licence.id).to.equal(licence.id)
          expect(data.licence.licenceRef).to.equal(licence.licenceRef)
          expect(data.licence.licenceHolder).to.equal('Luce Holder')
        })
      })
    })

    describe('but the licence does not exist', () => {
      it('throws a Boom not found error', async () => {
        const error = await expect(InitiateReturnRequirementSessionService.go('e456e538-4d55-4552-84f7-6a7636eb1945')).to.reject()

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
