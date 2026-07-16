// Test framework
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as CRMContactsSeeder from '../../support/seeders/crm-contacts.seeder.js'
import LicenceHelper from '../../support/helpers/licence.helper.js'
import LicenceVersionHelper from '../../support/helpers/licence-version.helper.js'
import { generateRandomInteger, generateUUID } from '../../../app/lib/general.lib.js'

// Things we need to stub
import databaseConfig from '../../../config/database.config.js'

// Thing under test
import FetchLicencesDal from '../../../app/dal/companies/fetch-licences.dal.js'

describe('Companies - Fetch Licences dal', () => {
  let anotherLicence
  let anotherLicenceVersion
  let companyId
  let licence
  let licenceHolder
  let olderLicenceVersion
  let otherLicence
  let otherLicenceVersion
  let pageNumber

  beforeAll(async () => {
    // This is the licence and details we expect to retrieve
    licence = await LicenceHelper.add({
      licenceRef: `02/${generateRandomInteger(10, 99)}/${generateRandomInteger(100, 999)}`
    })

    licenceHolder = await CRMContactsSeeder.licenceHolder({ licence }, 'Kanemitsu Corporation')

    companyId = licenceHolder.company.id

    // This is an older licence version linked to a different company. This confirms we are getting the right current
    // licence holder details
    olderLicenceVersion = await LicenceVersionHelper.add({
      increment: 0,
      issue: 1,
      licenceId: licence.id,
      startDate: new Date('2021-12-31'),
      companyId: generateUUID()
    })

    // This is another licence for the same company and details we expect to retrieve. This should appear first
    // in the results to confirm it is ordering them correctly
    anotherLicence = await LicenceHelper.add({
      licenceRef: `01/${generateRandomInteger(10, 99)}/${generateRandomInteger(100, 999)}`
    })

    anotherLicenceVersion = await LicenceVersionHelper.add({
      increment: 0,
      issue: 1,
      licenceId: anotherLicence.id,
      startDate: new Date('2025-04-01'),
      companyId: licenceHolder.company.id
    })

    // This is a different licence linked to a different company. This confirms we are only getting licences for the
    // selected company
    otherLicence = await LicenceHelper.add()
    otherLicenceVersion = await LicenceVersionHelper.add({
      increment: 0,
      issue: 2,
      licenceId: otherLicence.id,
      startDate: new Date('2025-04-01'),
      companyId: generateUUID()
    })
  })

  beforeEach(() => {
    pageNumber = '1'

    // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
    // part of the full suite, and the risk our test record is returned in the second page of results.
    vi.replaceProperty(databaseConfig, 'defaultPageSize', 1000)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(async () => {
    await licenceHolder.clean()

    await otherLicenceVersion.$query().delete()
    await otherLicence.$query().delete()
    await anotherLicenceVersion.$query().delete()
    await anotherLicence.$query().delete()
    await olderLicenceVersion.$query().delete()
    await licence.$query().delete()
  })

  describe('when called', () => {
    it('returns licences linked to the company where it is the licence holder', async () => {
      const result = await FetchLicencesDal(companyId, pageNumber)

      expect(result).toEqual({
        licences: [
          {
            expiredDate: null,
            id: anotherLicence.id,
            lapsedDate: null,
            licenceRef: anotherLicence.licenceRef,
            revokedDate: null,
            startDate: new Date('2022-01-01'),
            currentLicenceHolderId: licenceHolder.company.id,
            currentLicenceHolder: licenceHolder.company.name
          },
          {
            expiredDate: null,
            id: licence.id,
            lapsedDate: null,
            licenceRef: licence.licenceRef,
            revokedDate: null,
            startDate: new Date('2022-01-01'),
            currentLicenceHolderId: licenceHolder.company.id,
            currentLicenceHolder: licenceHolder.company.name
          }
        ],
        totalNumber: 2
      })
    })
  })
})
