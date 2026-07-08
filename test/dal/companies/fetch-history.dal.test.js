// Test framework dependencies

// Test helpers
import CRMContactsSeeder from '../../support/seeders/crm-contacts.seeder.js'
import * as LicenceHelper from '../../support/helpers/licence.helper.js'
import * as LicenceVersionHelper from '../../support/helpers/licence-version.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Things we need to stub
import DatabaseConfig from '../../../config/database.config.js'

// Thing under test
import FetchHistoryDal from '../../../app/dal/companies/fetch-history.dal.js'

describe('Companies - Fetch History dal', () => {
  let licence
  let licenceHolder
  let licenceVersionDifferentLicenceAndCompany
  let licenceVersionSameLicenceDifferentCompany
  let pageNumber

  beforeAll(async () => {
    licence = await LicenceHelper.add()

    // A licence version linked to the company
    licenceHolder = await CRMContactsSeeder.licenceHolder({ licence }, 'Omni Consumer Products')

    // A licence version not linked to the company
    licenceVersionSameLicenceDifferentCompany = await LicenceVersionHelper.add({
      licenceId: licence.id,
      companyId: generateUUID()
    })

    // A licence version not linked to the company or licence
    licenceVersionDifferentLicenceAndCompany = await LicenceVersionHelper.add({
      licenceId: generateUUID(),
      companyId: generateUUID()
    })

    pageNumber = '1'

    // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
    // part of the full suite, and the risk our test record is returned in the second page of results.
    vi.replaceProperty(DatabaseConfig, 'defaultPageSize', 1000)
  })

  afterAll(async () => {
    await licenceHolder.clean()

    await licence.$query().delete()
    await licenceVersionDifferentLicenceAndCompany.$query().delete()
    await licenceVersionSameLicenceDifferentCompany.$query().delete()

    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns licences linked to the company where it is the licence holder', async () => {
      const result = await FetchHistoryDal(licenceHolder.company.id, pageNumber)

      expect(result).toEqual({
        licences: [
          {
            expiredDate: null,
            id: licence.id,
            lapsedDate: null,
            licenceRef: licence.licenceRef,
            licenceVersions: [
              {
                administrative: null,
                endDate: null,
                id: licenceHolder.licenceVersion.id,
                startDate: new Date('2022-01-01')
              }
            ],
            revokedDate: null,
            startDate: new Date('2022-01-01')
          }
        ],
        totalNumber: 1
      })
    })
  })
})
