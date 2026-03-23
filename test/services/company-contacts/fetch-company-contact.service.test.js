'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactHelper = require('../../support/helpers/company-contact.helper.js')
const ContactHelper = require('../../support/helpers/contact.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchCompanyContactService = require('../../../app/services/company-contacts/fetch-company-contact.service.js')

describe('Company Contacts - Fetch Company Contact service', () => {
  const companyId = generateUUID()

  let companyContact
  let contact

  before(async () => {
    contact = await ContactHelper.add()
    companyContact = await CompanyContactHelper.add({ companyId, contactId: contact.id })
  })

  after(async () => {
    await companyContact.$query().delete()
    await contact.$query().delete()
  })

  describe('when there is a company contact', () => {
    it('returns the company contact and associated contact record', async () => {
      const result = await FetchCompanyContactService.go(companyContact.id)

      expect(result).to.equal({
        companyId,
        id: companyContact.id,
        contact: {
          contactType: 'person',
          department: null,
          email: null,
          firstName: 'Amara',
          id: contact.id,
          initials: null,
          lastName: 'Gupta',
          middleInitials: null,
          salutation: null,
          suffix: null
        }
      })
    })
  })
})
