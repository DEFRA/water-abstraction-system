'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, before, afterEach, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CRMContactsSeeder = require('../../support/seeders/crm-contacts.seeder.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const { generateRandomInteger, generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const databaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchLicencesDal = require('../../../app/dal/companies/fetch-licences.dal.js')

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

  before(async () => {
    // This is the licence and details we expect to retrieve
    licence = await LicenceHelper.add({
      licenceRef: `02/${generateRandomInteger(10, 99)}/${generateRandomInteger(100, 999)}`
    })

    licenceHolder = await CRMContactsSeeder.licenceHolder({ licence }, 'Kanemitsu Corporation')

    companyId = licenceHolder.company.id

    //startDate: new Date('2022-01-01'),

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
    Sinon.stub(databaseConfig, 'defaultPageSize').value(1000)
  })

  afterEach(() => {
    Sinon.restore()
  })

  after(async () => {
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
      const result = await FetchLicencesDal.go(companyId, pageNumber)

      expect(result).to.equal({
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
