'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CRMContactsSeeder = require('../../support/seeders/crm-contacts.seeder.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const DatabaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchHistoryDal = require('../../../app/dal/companies/fetch-history.dal.js')

describe('Companies - Fetch History dal', () => {
  let licence
  let licenceHolder
  let licenceVersionDifferentLicenceAndCompany
  let licenceVersionSameLicenceDifferentCompany
  let pageNumber

  before(async () => {
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
    Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1000)
  })

  after(async () => {
    await licenceHolder.clean()

    await licence.$query().delete()
    await licenceVersionDifferentLicenceAndCompany.$query().delete()
    await licenceVersionSameLicenceDifferentCompany.$query().delete()

    Sinon.restore()
  })

  describe('when called', () => {
    it('returns licences linked to the company where it is the licence holder', async () => {
      const result = await FetchHistoryDal.go(licenceHolder.company.id, pageNumber)

      expect(result).to.equal({
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
