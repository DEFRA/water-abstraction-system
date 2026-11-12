// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import DatabaseConfig from 'water-abstraction-engine/config/database.config.js'
import * as CRMSeeder from '../../support/seeders/crm.seeder.js'

// Thing under test
import FetchLicenceCRMDataService from '../../../src/services/licences/fetch-licence-crm-data.service.js'

describe('Licences - Fetch Licence CRM data service', () => {
  let crmData
  let licence
  let page
  let roles

  beforeAll(async () => {
    page = undefined

    crmData = await CRMSeeder.seed()

    roles = ['billing']

    licence = crmData.licence.record
  })

  afterAll(async () => {
    await crmData.clean()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the licence has contact details', () => {
    it('returns the matching licence contacts', async () => {
      const result = await FetchLicenceCRMDataService(licence.id, roles)

      expect(result).toEqual({
        contacts: [
          {
            addressId: null,
            contactName: 'albus.dumbledore@hogwarts.com',
            contactType: 'primary-user',
            id: crmData.primaryUser.record.id
          },
          {
            addressId: null,
            contactName: 'Hogwarts',
            contactType: 'licence-holder',
            id: crmData.company.record.id
          },
          {
            addressId: crmData.returnsTo.record.addressId,
            contactName: 'Hogwarts',
            contactType: 'returns-to',
            id: crmData.company.record.id
          },
          {
            addressId: null,
            contactName: 'Horace Slughorn',
            contactType: 'additional-contact',
            id: crmData.additionalContact.record.id
          },
          {
            addressId: null,
            contactName: 'minerva.mchonagall@hogwarts.com',
            contactType: 'basic-user',
            id: crmData.basicUser.record.id
          },
          {
            addressId: null,
            contactName: 'Prof Gilderoy Lockhart',
            contactType: 'abstraction-alerts',
            id: crmData.abstractionAlerts.record.id
          },
          {
            addressId: null,
            contactName: 'severus.snape@hogwarts.com',
            contactType: 'returns-user',
            id: crmData.returnsUser.record.id
          },
          {
            addressId: null,
            contactName: crmData.billing.record.accountNumber,
            contactType: 'billing',
            id: crmData.billing.record.id
          }
        ],
        totalNumber: 8
      })
    })

    describe('and the licence has a "NALD GAP" charge version in its history', () => {
      it('returns the matching licence contacts including the billing contact (even with a NALD GAP charge version)', async () => {
        const result = await FetchLicenceCRMDataService(crmData.otherLicence.record.id, roles)

        expect(result).toEqual({
          contacts: [
            {
              addressId: null,
              contactName: 'Draco Malfoy',
              contactType: 'basic-user',
              id: crmData.otherBasicUser.record.id
            },
            {
              addressId: null,
              contactName: crmData.otherBilling.record.accountNumber,
              contactType: 'billing',
              id: crmData.otherBilling.record.id
            },
            {
              addressId: null,
              contactName: "Weasleys' Wizard Wheezes",
              contactType: 'licence-holder',
              id: crmData.otherCompany.record.id
            }
          ],
          totalNumber: 3
        })
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
          const result = await FetchLicenceCRMDataService(licence.id, roles, page)

          expect(result).toEqual({
            contacts: [
              {
                addressId: null,
                contactName: 'albus.dumbledore@hogwarts.com',
                contactType: 'primary-user',
                id: crmData.primaryUser.record.id
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
          const result = await FetchLicenceCRMDataService(licence.id, roles, page)

          expect(result).toEqual({
            contacts: [
              {
                addressId: null,
                contactName: 'albus.dumbledore@hogwarts.com',
                contactType: 'primary-user',
                id: crmData.primaryUser.record.id
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
          const result = await FetchLicenceCRMDataService(licence.id, roles, page)

          expect(result).toEqual({
            contacts: [
              {
                addressId: null,
                contactName: 'Hogwarts',
                contactType: 'licence-holder',
                id: crmData.company.record.id
              }
            ],
            totalNumber: 8
          })
        })
      })
    })
  })
})
