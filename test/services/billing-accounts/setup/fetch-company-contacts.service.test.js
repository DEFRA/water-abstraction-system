'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')

// Thing under test
const FetchCompanyContactsService = require('../../../../app/services/billing-accounts/setup/fetch-company-contacts.service.js')

describe('Billing Accounts - Setup - Fetch Company Contacts service', () => {
  let company
  let companyContact
  let companyWithNoContact
  let contact

  before(async () => {
    contact = await ContactHelper.add()
    company = await CompanyHelper.add()
    companyWithNoContact = await CompanyHelper.add()

    companyContact = await CompanyContactHelper.add({
      companyId: company.id,
      contactId: contact.id
    })
  })

  after(async () => {
    await company.$query().delete()
    await companyContact.$query().delete()
    await companyWithNoContact.$query().delete()
    await contact.$query().delete()
  })

  describe('when a matching company exists and has an contact', () => {
    it('returns the company name and matching contact', async () => {
      const result = await FetchCompanyContactsService.go(company.id)

      expect(result).to.equal({
        company: {
          id: company.id,
          name: company.name
        },
        contacts: [
          {
            id: contact.id,
            salutation: null,
            firstName: 'Amara',
            middleInitials: null,
            lastName: 'Gupta',
            initials: null,
            contactType: 'person',
            suffix: null,
            department: null
          }
        ]
      })
    })
  })

  describe('when a matching company exists and has no contact', () => {
    it('returns the company name and an empty contacts array', async () => {
      const result = await FetchCompanyContactsService.go(companyWithNoContact.id)

      expect(result).to.equal({
        company: {
          id: companyWithNoContact.id,
          name: companyWithNoContact.name
        },
        contacts: []
      })
    })
  })
})
