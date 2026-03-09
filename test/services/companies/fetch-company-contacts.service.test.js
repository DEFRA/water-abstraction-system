'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompantContactsSeeder = require('../../support/seeders/company-contacts.seeder.js')

// Thing under test
const FetchCompanyContactsService = require('../../../app/services/companies/fetch-company-contacts.service.js')

describe.only('Companies - Fetch Company Contacts service', () => {
  let company
  let companyContacts

  before(async () => {
    companyContacts = await CompantContactsSeeder.seed()

    company = companyContacts.company
  })

  after(async () => {
    await companyContacts.clean()
  })

  describe('when there are company contacts', () => {
    it('returns the matching company contacts', async () => {
      const result = await FetchCompanyContactsService.go(company.record.id)

      expect(result).to.equal({
        companyContacts: [
          {
            contact_type: 'abstraction-alerts',
            id: companyContacts.abstractionAlerts.record.id,
            name: 'Granny Weatherwax'
          },
          {
            contact_type: 'additional-contact',
            id: companyContacts.additionalContact.record.id,
            name: 'Two flower'
          },
          {
            contact_type: 'basic-user',
            id: companyContacts.basicUser.record.id,
            name: companyContacts.basicUser.record.username
          },
          {
            contact_type: 'licence-holder',
            id: companyContacts.company.record.id,
            name: 'Ankh-Morpork'
          }
        ],
        totalNumber: 4
      })
    })
  })
})
