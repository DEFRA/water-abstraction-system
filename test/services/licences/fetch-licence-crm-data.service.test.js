// Test framework dependencies

// Test helpers
import DatabaseConfig from '../../../config/database.config.js'
import * as CRMSeeder from '../../support/seeders/crm.seeder.js'

// Thing under test
import FetchLicenceCRMDataService from '../../../app/services/licences/fetch-licence-crm-data.service.js'

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
            contactType: 'primary-user',
            id: crmData.primaryUser.record.id,
            contactName: 'albus.dumbledore@hogwarts.com'
          },
          {
            addressId: null,
            contactType: 'licence-holder',
            id: crmData.company.record.id,
            contactName: 'Hogwarts'
          },
          {
            addressId: crmData.returnsTo.record.addressId,
            contactType: 'returns-to',
            id: crmData.company.record.id,
            contactName: 'Hogwarts'
          },
          {
            addressId: null,
            contactType: 'additional-contact',
            id: crmData.additionalContact.record.id,
            contactName: 'Horace Slughorn'
          },
          {
            addressId: null,
            contactType: 'basic-user',
            id: crmData.basicUser.record.id,
            contactName: 'minerva.mchonagall@hogwarts.com'
          },
          {
            addressId: null,
            contactType: 'abstraction-alerts',
            id: crmData.abstractionAlerts.record.id,
            contactName: 'Prof Gilderoy Lockhart'
          },
          {
            addressId: null,
            contactType: 'returns-user',
            id: crmData.returnsUser.record.id,
            contactName: 'severus.snape@hogwarts.com'
          },
          {
            addressId: null,
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
        const result = await FetchLicenceCRMDataService(crmData.otherLicence.record.id, roles)

        expect(result).toEqual({
          contacts: [
            {
              addressId: null,
              id: crmData.otherBasicUser.record.id,
              contactName: 'Draco Malfoy',
              contactType: 'basic-user'
            },
            {
              addressId: null,
              id: crmData.otherBilling.record.id,
              contactName: crmData.otherBilling.record.accountNumber,
              contactType: 'billing'
            },
            {
              addressId: null,
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
          const result = await FetchLicenceCRMDataService(licence.id, roles, page)

          expect(result).toEqual({
            contacts: [
              {
                addressId: null,
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
          const result = await FetchLicenceCRMDataService(licence.id, roles, page)

          expect(result).toEqual({
            contacts: [
              {
                addressId: null,
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
