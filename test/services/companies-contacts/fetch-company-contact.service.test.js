'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')

// Thing under test
const FetchCompanyContactService = require('../../../app/services/companies-contacts/fetch-company-contact.service.js')

describe('Companies Contacts - Fetch company contact service', () => {
  let companyContact
  let contact

  describe('when there is a company contact', () => {
    before(async () => {
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
})
