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
const DeleteCompanyContactService = require('../../../app/services/company-contacts/delete-company-contact.service.js')

describe('Company Contacts - Delete Company Contact service', () => {
  let companyContact
  let contact

  describe('when there is a company contact', () => {
    before(async () => {
      contact = await ContactHelper.add()

      companyContact = await CompanyContactHelper.add({
        contactId: contact.id
      })

      await CompanyContactHelper.add({
        contactId: contact.id
      })
    })

    it('returns the matching company', async () => {
      const result = await DeleteCompanyContactService.go(companyContact.id)

      expect(result).to.equal(1)

      // Assert the company contact is deleted
      const companyContactExists = await companyContact.$query().select()
      expect(companyContactExists).to.be.undefined()
    })
  })
})
