'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../../support/helpers/company.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')

// Thing under test
const FetchContactsService = require('../../../app/services/customers/fetch-company-contacts.service.js')

describe('Customers - Fetch company contacts service', () => {
  let company
  let companyContact
  let contact
  let licenceRole

  describe('when there is a company contact', () => {
    before(async () => {
      company = await CompanyHelper.add()

      contact = await ContactHelper.add()

      licenceRole = LicenceRoleHelper.select('additionalContact')

      companyContact = await CompanyContactHelper.add({
        companyId: company.id,
        contactId: contact.id,
        licenceRoleId: licenceRole.id
      })

      // Add additional contact - not related to the company
      const additionalContact = await ContactHelper.add()

      await CompanyContactHelper.add({
        contactId: additionalContact.id
      })
    })

    it('returns the matching company', async () => {
      const result = await FetchContactsService.go(company.id)

      expect(result).to.equal({
        companyContacts: [
          {
            id: companyContact.id,
            abstractionAlerts: false,
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
            },
            licenceRole: {
              label: licenceRole.label
            }
          }
        ],
        pagination: { total: 1 }
      })
    })
  })
})
