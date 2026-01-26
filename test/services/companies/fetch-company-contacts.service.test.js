'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')

// Thing under test
const FetchCompanyContactsService = require('../../../app/services/companies/fetch-company-contacts.service.js')

describe.only('Companies - Fetch Company Contacts service', () => {
  let additionalCompanyContact
  let companyContact
  let contact
  let licenceRole

  before(async () => {
    licenceRole = LicenceRoleHelper.select('additionalContact')

    contact = await ContactHelper.add()

    companyContact = await CompanyContactHelper.add({
      contactId: contact.id,
      licenceRoleId: licenceRole.id
    })

    // Add additional contact - not related to the same company
    additionalCompanyContact = await CompanyContactHelper.add({ contactId: contact.id })
  })

  after(async () => {
    await contact.$query().delete()
    await companyContact.$query().delete()
    await additionalCompanyContact.$query().delete()
  })

  describe('when there is a company contact', () => {
    it('returns the matching company', async () => {
      const result = await FetchCompanyContactsService.go(companyContact.companyId)

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
