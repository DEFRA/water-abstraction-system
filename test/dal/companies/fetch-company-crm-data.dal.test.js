// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as CRMSeeder from '../../support/seeders/crm.seeder.js'

// Things we need to stub
import DatabaseConfig from 'water-abstraction-engine/config/database.config.js'

// Thing under test
import FetchCompanyCRMDataDal from '../../../src/dal/companies/fetch-company-crm-data.dal.js'

describe('Companies - Fetch Company CRM Data dal', () => {
  let company
  let crmData
  let page
  let roles

  beforeAll(async () => {
    page = undefined

    crmData = await CRMSeeder.seed()

    roles = ['billing']

    company = crmData.company
  })

  afterAll(async () => {
    await crmData.clean()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when there are contacts', () => {
    it('returns the matching contacts', async () => {
      const result = await FetchCompanyCRMDataDal(company.record.id, roles, page)

      expect(result).toEqual({
        contacts: [
          {
            contactName: 'albus.dumbledore@hogwarts.com',
            contactType: 'primary-user',
            id: crmData.primaryUser.record.id
          },
          {
            contactName: 'Hogwarts',
            contactType: 'licence-holder',
            id: crmData.company.record.id
          },
          {
            contactName: 'Hogwarts',
            contactType: 'returns-to',
            id: crmData.company.record.id
          },
          {
            contactName: 'Horace Slughorn',
            contactType: 'additional-contact',
            id: crmData.additionalContact.record.id
          },
          {
            contactName: 'minerva.mchonagall@hogwarts.com',
            contactType: 'basic-user',
            id: crmData.basicUser.record.id
          },
          {
            contactName: 'Prof Gilderoy Lockhart',
            contactType: 'abstraction-alerts',
            id: crmData.abstractionAlerts.record.id
          },
          {
            contactName: 'rubeus.hagrid@hogwarts.com',
            contactType: 'basic-user',
            id: crmData.extraBasicUser.record.id
          },
          {
            contactName: 'severus.snape@hogwarts.com',
            contactType: 'returns-user',
            id: crmData.returnsUser.record.id
          },
          {
            contactName: crmData.billing.record.accountNumber,
            contactType: 'billing',
            id: crmData.billing.record.id
          }
        ],
        totalNumber: 9
      })
    })

    describe('when paginating', () => {
      beforeEach(() => {
        vi.replaceProperty(DatabaseConfig, 'defaultPageSize', 1)
      })

      describe('and the page is not set', () => {
        beforeEach(() => {
          page = undefined
        })

        it('returns the matching contacts for the page (defaulted to 1) with the total number', async () => {
          const result = await FetchCompanyCRMDataDal(company.record.id, roles, page)

          expect(result).toEqual({
            contacts: [
              {
                contactName: 'albus.dumbledore@hogwarts.com',
                contactType: 'primary-user',
                id: crmData.primaryUser.record.id
              }
            ],
            totalNumber: 9
          })
        })
      })

      describe('and the page is set to 1', () => {
        beforeEach(() => {
          page = '1'
        })

        it('returns the matching contacts for the page (defaulted to 1) with the total number', async () => {
          const result = await FetchCompanyCRMDataDal(company.record.id, roles, page)

          expect(result).toEqual({
            contacts: [
              {
                contactName: 'albus.dumbledore@hogwarts.com',
                contactType: 'primary-user',
                id: crmData.primaryUser.record.id
              }
            ],
            totalNumber: 9
          })
        })
      })

      describe('and the page is set to greater than 1', () => {
        beforeEach(() => {
          page = '2'
        })

        it('returns the matching contacts for the page (the second page) with the total number', async () => {
          const result = await FetchCompanyCRMDataDal(company.record.id, roles, page)

          expect(result).toEqual({
            contacts: [
              {
                contactName: 'Hogwarts',
                contactType: 'licence-holder',
                id: crmData.company.record.id
              }
            ],
            totalNumber: 9
          })
        })
      })
    })
  })
})
