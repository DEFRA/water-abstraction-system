'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../../support/helpers/company-contact.helper.js')
const CompanyHelper = require('../../../support/helpers/company.helper.js')
const ContactHelper = require('../../../support/helpers/contact.helper.js')

// Thing under test
const FetchCompanyContactService = require('../../../../app/services/company-contacts/setup/fetch-company-contact.service.js')

describe('Company Contacts - Setup - Fetch Company Contact service', () => {
  let company
  let companyContact
  let contact

  before(async () => {
    company = await CompanyHelper.add()

    contact = await ContactHelper.add({ department: 'Tyrell Corp' })

    companyContact = await CompanyContactHelper.add({
      abstractionAlerts: false,
      contactId: contact.id,
      companyId: company.id
    })
  })

  after(async () => {
    await companyContact.$query().delete()
    await contact.$query().delete()
  })

  describe('when there is a company contact', () => {
    it('returns the matching company contact', async () => {
      const result = await FetchCompanyContactService.go(companyContact.id)

      expect(result).to.equal({
        abstractionAlerts: false,
        company: {
          id: company.id,
          name: 'Example Trading Ltd'
        },
        contact: {
          department: 'Tyrell Corp',
          email: 'amara.gupta@example.com',
          id: contact.id
        },
        id: companyContact.id
      })
    })
  })
})
