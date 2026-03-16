'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, after, afterEach, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CRMSeeder = require('../../support/seeders/crm.seeder.js')

// Things we need to stub
const DatabaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchCompanyCRMDataService = require('../../../app/services/companies/fetch-company-crm-data.service.js')

describe('Companies - Fetch company crm data service', () => {
  let company
  let crmData
  let page
  let roles

  before(async () => {
    page = undefined
    crmData = await CRMSeeder.seed()

    roles = ['billing']

    company = crmData.company
  })

  after(async () => {
    await crmData.clean()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are contacts', () => {
    it('returns the matching contacts', async () => {
      const result = await FetchCompanyCRMDataService.go(company.record.id, roles, page)

      expect(result).to.equal({
        contacts: [
          {
            contactType: 'primary-user',
            id: crmData.primaryUser.record.id,
            contactName: 'Albus Dumbledore'
          },
          {
            contactType: 'abstraction-alerts',
            id: crmData.abstractionAlerts.record.id,
            contactName: 'Gilderoy Lockhart'
          },
          {
            contactType: 'licence-holder',
            id: crmData.company.record.id,
            contactName: 'Hogwarts'
          },
          {
            contactType: 'returns-to',
            id: crmData.company.record.id,
            contactName: 'Hogwarts'
          },
          {
            contactType: 'additional-contact',
            id: crmData.additionalContact.record.id,
            contactName: 'Horace Slughorn'
          },
          {
            contactType: 'basic-user',
            id: crmData.basicUser.record.id,
            contactName: 'Minerva McGonagall'
          },
          {
            contactName: 'Rubeus Hagrid',
            contactType: 'basic-user',
            id: crmData.additionalBasicUser.record.id
          },
          {
            contactType: 'returns-user',
            id: crmData.returnsUser.record.id,
            contactName: 'Severus Snape'
          },
          {
            contactType: 'billing',
            id: crmData.billing.record.id,
            contactName: crmData.billing.record.accountNumber
          }
        ],
        totalNumber: 9
      })
    })

    describe('when paginating', () => {
      describe('and the page is not set', () => {
        beforeEach(() => {
          Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1)

          page = undefined
        })

        it('returns the matching contacts for the page (defaulted to 1) with the total number', async () => {
          const result = await FetchCompanyCRMDataService.go(company.record.id, roles, page)

          expect(result).to.equal({
            contacts: [
              {
                contactType: 'primary-user',
                id: crmData.primaryUser.record.id,
                contactName: 'Albus Dumbledore'
              }
            ],
            totalNumber: 9
          })
        })
      })

      describe('and the page is set to 1', () => {
        beforeEach(() => {
          Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1)

          page = 1
        })

        it('returns the matching contacts for the page (defaulted to 1) with the total number', async () => {
          const result = await FetchCompanyCRMDataService.go(company.record.id, roles, page)

          expect(result).to.equal({
            contacts: [
              {
                contactType: 'primary-user',
                id: crmData.primaryUser.record.id,
                contactName: 'Albus Dumbledore'
              }
            ],
            totalNumber: 9
          })
        })
      })

      describe('and the page is set to greater than 1', () => {
        beforeEach(() => {
          Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1)

          page = 2
        })

        it('returns the matching contacts for the page (the second page) with the total number', async () => {
          const result = await FetchCompanyCRMDataService.go(company.record.id, roles, page)

          expect(result).to.equal({
            contacts: [
              {
                contactType: 'abstraction-alerts',
                id: crmData.abstractionAlerts.record.id,
                contactName: 'Gilderoy Lockhart'
              }
            ],
            totalNumber: 9
          })
        })
      })
    })
  })
})
