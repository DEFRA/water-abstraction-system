'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, after, afterEach, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyContactsSeeder = require('../../support/seeders/company-contacts.seeder.js')

// Things we need to stub
const DatabaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchCompanyContactsService = require('../../../app/services/companies/fetch-company-contacts.service.js')

describe('Companies - Fetch Company Contacts service', () => {
  let company
  let companyContacts
  let page

  before(async () => {
    page = undefined
    companyContacts = await CompanyContactsSeeder.seed()

    company = companyContacts.company
  })

  after(async () => {
    await companyContacts.clean()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are company contacts', () => {
    it('returns the matching company contacts', async () => {
      const result = await FetchCompanyContactsService.go(company.record.id, page)

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

    describe('when paginating', () => {
      describe('and the page is not set', () => {
        beforeEach(() => {
          Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1)

          page = undefined
        })

        it('returns the matching company contacts for the page (defaulted to 1) with the total number', async () => {
          const result = await FetchCompanyContactsService.go(company.record.id, page)

          expect(result).to.equal({
            companyContacts: [
              {
                contactType: 'primary-user',
                id: companyContacts.primaryUser.record.id,
                contactName: 'Albus Dumbledore'
              }
            ],
            totalNumber: 8
          })
        })
      })

      describe('and the page is set to 1', () => {
        beforeEach(() => {
          Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1)

          page = 1
        })

        it('returns the matching company contacts for the page (defaulted to 1) with the total number', async () => {
          const result = await FetchCompanyContactsService.go(company.record.id, page)

          expect(result).to.equal({
            companyContacts: [
              {
                contactType: 'primary-user',
                id: companyContacts.primaryUser.record.id,
                contactName: 'Albus Dumbledore'
              }
            ],
            totalNumber: 8
          })
        })
      })

      describe('and the page is set to greater than 1', () => {
        beforeEach(() => {
          Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1)

          page = 2
        })

        it('returns the matching company contacts for the page (the second page) with the total number', async () => {
          const result = await FetchCompanyContactsService.go(company.record.id, page)

          expect(result).to.equal({
            companyContacts: [
              {
                contactType: 'abstraction-alerts',
                id: companyContacts.abstractionAlerts.record.id,
                contactName: 'Gilderoy Lockhart'
              }
            ],
            totalNumber: 8
          })
        })
      })
    })
  })
})
