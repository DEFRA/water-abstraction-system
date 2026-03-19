'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, after, afterEach, before, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const DatabaseConfig = require('../../../config/database.config.js')
const CRMSeeder = require('../../support/seeders/crm.seeder.js')

// Thing under test
const FetchLicenceCRMDataService = require('../../../app/services/licences/fetch-licence-crm-data.service.js')

describe('Licences - Fetch Licence CRM data service', () => {
  let crmData
  let licence
  let page
  let roles

  before(async () => {
    page = undefined

    crmData = await CRMSeeder.seed()

    roles = ['billing']

    licence = crmData.licence.record
  })

  after(async () => {
    await crmData.clean()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the licence has contact details', () => {
    it('returns the matching licence contacts', async () => {
      const result = await FetchLicenceCRMDataService.go(licence.id, roles)

      expect(result).to.equal({
        contacts: [
          {
            contactType: 'primary-user',
            id: crmData.primaryUser.record.id,
            contactName: 'albus.dumbledore@hogwarts.com'
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
            contactName: 'minerva.mchonagall@hogwarts.com'
          },
          {
            contactType: 'abstraction-alerts',
            id: crmData.abstractionAlerts.record.id,
            contactName: 'Prof Gilderoy Lockhart'
          },
          {
            contactType: 'returns-user',
            id: crmData.returnsUser.record.id,
            contactName: 'severus.snape@hogwarts.com'
          },
          {
            contactType: 'billing',
            id: crmData.billing.record.id,
            contactName: crmData.billing.record.accountNumber
          }
        ],
        totalNumber: 8
      })
    })

    describe('and the licence has a "NALD GAP" charge version in its history', () => {
      it('returns the matching licence contacts including the billing contact (even with a NALD GAP charge version)', async () => {
        const result = await FetchLicenceCRMDataService.go(crmData.otherLicence.record.id, roles)

        expect(result).to.equal({
          contacts: [
            {
              id: crmData.otherBasicUser.record.id,
              contactName: 'Draco Malfoy',
              contactType: 'basic-user'
            },
            {
              id: crmData.otherBilling.record.id,
              contactName: crmData.otherBilling.record.accountNumber,
              contactType: 'billing'
            },
            {
              id: crmData.otherCompany.record.id,
              contactName: "Weasleys' Wizard Wheezes",
              contactType: 'licence-holder'
            }
          ],
          totalNumber: 3
        })
      })
    })

    describe('when paginating', () => {
      beforeEach(() => {
        Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1)
      })

      describe('and the page is not set', () => {
        beforeEach(() => {
          page = undefined
        })

        it('returns the matching contacts for the page (defaulted to 1) with the total number', async () => {
          const result = await FetchLicenceCRMDataService.go(licence.id, roles, page)

          expect(result).to.equal({
            contacts: [
              {
                contactType: 'primary-user',
                id: crmData.primaryUser.record.id,
                contactName: 'albus.dumbledore@hogwarts.com'
              }
            ],
            totalNumber: 8
          })
        })
      })

      describe('and the page is set to 1', () => {
        beforeEach(() => {
          page = '1'
        })

        it('returns the matching contacts for the page (defaulted to 1) with the total number', async () => {
          const result = await FetchLicenceCRMDataService.go(licence.id, roles, page)

          expect(result).to.equal({
            contacts: [
              {
                contactType: 'primary-user',
                id: crmData.primaryUser.record.id,
                contactName: 'albus.dumbledore@hogwarts.com'
              }
            ],
            totalNumber: 8
          })
        })
      })

      describe('and the page is set to greater than 1', () => {
        beforeEach(() => {
          page = '2'
        })

        it('returns the matching contacts for the page (the second page) with the total number', async () => {
          const result = await FetchLicenceCRMDataService.go(licence.id, roles, page)

          expect(result).to.equal({
            contacts: [
              {
                contactType: 'licence-holder',
                id: crmData.company.record.id,
                contactName: 'Hogwarts'
              }
            ],
            totalNumber: 8
          })
        })
      })
    })
  })
})
