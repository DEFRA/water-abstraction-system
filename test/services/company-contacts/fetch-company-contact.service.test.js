'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const LicenceDocumentRoleHelper = require('../../support/helpers/licence-document-role.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')

// Thing under test
const FetchCompanyContactService = require('../../../app/services/company-contacts/fetch-company-contact.service.js')

describe('Company Contacts - Fetch Company Contact service', () => {
  let companyContact
  let contact

  describe('when there is a company contact', () => {
    describe('', () => {
      beforeEach(async () => {
        contact = await ContactHelper.add()

        companyContact = await CompanyContactHelper.add({
          contactId: contact.id
        })
      })

      it('returns the matching company', async () => {
        const result = await FetchCompanyContactService.go(companyContact.id)

        expect(result).to.equal({
          id: companyContact.id,
          abstractionAlerts: false,
          abstractionAlertsCount: 0,
          companyId: companyContact.companyId,
          contact: {
            id: contact.id,
            salutation: null,
            firstName: 'Amara',
            middleInitials: null,
            lastName: 'Gupta',
            initials: null,
            contactType: 'person',
            suffix: null,
            department: null,
            email: 'amara.gupta@example.com'
          }
        })
      })
    })

    describe('when a company contact is marked for "abstractionAlerts"', () => {
      let licenceRole

      beforeEach(async () => {
        contact = await ContactHelper.add()

        companyContact = await CompanyContactHelper.add({
          contactId: contact.id,
          abstractionAlerts: true
        })

        licenceRole = LicenceRoleHelper.select('additionalContact')

        await LicenceDocumentRoleHelper.add({
          companyId: companyContact.companyId,
          contactId: contact.id,
          endDate: null,
          licenceRoleId: licenceRole.id
        })

        const additionalCompanyContact = await CompanyContactHelper.add({
          contactId: contact.id,
          abstractionAlerts: true
        })

        await LicenceDocumentRoleHelper.add({
          companyId: additionalCompanyContact.companyId,
          contactId: contact.id,
          endDate: new Date('1999-01-01'),
          licenceRoleId: licenceRole.id
        })
      })

      it('returns the matching company (with the "abstractionAlertsCount")', async () => {
        const result = await FetchCompanyContactService.go(companyContact.id)

        expect(result).to.equal({
          id: companyContact.id,
          abstractionAlerts: true,
          abstractionAlertsCount: 1,
          companyId: companyContact.companyId,
          contact: {
            id: contact.id,
            salutation: null,
            firstName: 'Amara',
            middleInitials: null,
            lastName: 'Gupta',
            initials: null,
            contactType: 'person',
            suffix: null,
            department: null,
            email: 'amara.gupta@example.com'
          }
        })
      })

      it('returns the "abstractionAlertsCount"', async () => {
        const result = await FetchCompanyContactService.go(companyContact.id)

        expect(result.abstractionAlertsCount).to.equal(1)
      })
    })
  })
})
