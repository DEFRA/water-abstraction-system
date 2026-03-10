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

describe('Companies - Fetch Company Contacts service', () => {
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
            contactType: 'primary-user',
            id: companyContacts.primaryUser.record.id,
            contactName: 'Albus Dumbledore'
          },
          {
            contactType: 'abstraction-alerts',
            id: companyContacts.abstractionAlerts.record.id,
            contactName: 'Gilderoy Lockhart'
          },
          {
            contactType: 'licence-holder',
            id: companyContacts.company.record.id,
            contactName: 'Hogwarts'
          },
          {
            contactType: 'returns-to',
            id: companyContacts.company.record.id,
            contactName: 'Hogwarts'
          },
          {
            contactType: 'additional-contact',
            id: companyContacts.additionalContact.record.id,
            contactName: 'Horace Slughorn'
          },
          {
            contactType: 'basic-user',
            id: companyContacts.basicUser.record.id,
            contactName: 'Minerva McGonagall'
          },
          {
            contactType: 'returns-user',
            id: companyContacts.returnsUser.record.id,
            contactName: 'Severus Snape'
          },
          {
            contactType: 'billing',
            id: companyContacts.billing.record.id,
            contactName: companyContacts.billing.record.accountNumber
          }
        ],
        totalNumber: 8
      })
    })
  })
})
