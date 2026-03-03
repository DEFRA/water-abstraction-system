'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, before, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/company.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionHolder = require('../../support/helpers/licence-version-holder.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const DatabaseConfig = require('../../../config/database.config.js')

// Thing under test
const FetchLicencesService = require('../../../app/services/companies/fetch-licences.service.js')

describe('Companies - Fetch Licences service', () => {
  let company
  let licence
  let licenceVersion
  let licenceVersionHolder
  let licenceVersionSameLicenceNoCompany
  let licenceVersionSameLicenceHolderNoCompany
  let licenceVersionHolderSameLicenceDifferentCompany
  let licenceVersionSameLicenceDifferentCompany
  let pageNumber

  before(async () => {
    company = await CompanyHelper.add()
    licence = await LicenceHelper.add()

    // A licence version/holder linked to the company
    licenceVersion = await LicenceVersionHelper.add({
      licenceId: licence.id
    })

    licenceVersionHolder = await LicenceVersionHolder.add({
      companyId: company.id,
      licenceVersionId: licenceVersion.id
    })

    // A licence version/holder not linked to the company
    licenceVersionSameLicenceDifferentCompany = await LicenceVersionHelper.add({
      licenceId: licence.id
    })

    licenceVersionHolderSameLicenceDifferentCompany = await LicenceVersionHolder.add({
      companyId: generateUUID(),
      licenceVersionId: licenceVersionSameLicenceDifferentCompany.id
    })

    // A licence version/holder not linked to any company
    licenceVersionSameLicenceNoCompany = await LicenceVersionHelper.add({
      licenceId: licence.id
    })

    licenceVersionSameLicenceHolderNoCompany = await LicenceVersionHolder.add({
      companyId: null,
      licenceVersionId: licenceVersionSameLicenceNoCompany.id
    })
  })

  beforeEach(() => {
    pageNumber = 1

    // NOTE: We set the default page size to 1000 to ensure we get all records and avoid failed tests when run as
    // part of the full suite, and the risk our test record is returned in the second page of results.
    Sinon.stub(DatabaseConfig, 'defaultPageSize').value(1000)
  })

  afterEach(() => {
    Sinon.restore()
  })

  afterEach(async () => {
    await company.$query().delete()
    await licence.$query().delete()
    await licenceVersion.$query().delete()
    await licenceVersionHolder.$query().delete()
    await licenceVersionSameLicenceDifferentCompany.$query().delete()
    await licenceVersionHolderSameLicenceDifferentCompany.$query().delete()
    await licenceVersionSameLicenceNoCompany.$query().delete()
    await licenceVersionSameLicenceHolderNoCompany.$query().delete()
  })

  describe('when called', () => {
    it('returns licences linked to the company where it is the licence holder', async () => {
      const result = await FetchLicencesService.go(company.id, pageNumber)

      expect(result).to.equal({
        licences: [
          {
            expiredDate: null,
            id: licence.id,
            lapsedDate: null,
            licenceRef: licence.licenceRef,
            licenceVersions: [
              {
                endDate: null,
                id: licenceVersion.id,
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
