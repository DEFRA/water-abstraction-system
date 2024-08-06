'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FetchLegacyImportLicenceService = require('../../../app/services/import/legacy-import/fetch-licence.service.js')
const FetchLegacyImportLicenceVersionsService = require('../../../app/services/import/legacy-import/fetch-licence-versions.service.js')
const FixtureLicence = require('./_fixtures/licence.js')
const FixtureVersions = require('./_fixtures/versions.js')
const LicenceModel = require('../../../app/models/licence.model.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const LegacyLicenceService =
  require('../../../app/services/import/legacy-licence.service.js')

describe('Import - Legacy Licence service', () => {
  const licenceRef = FixtureLicence.LIC_NO

  const region = RegionHelper.select(8)

  beforeEach(async () => {
    Sinon.stub(FetchLegacyImportLicenceService, 'go').resolves({
      ...FixtureLicence,
      FGAC_REGION_CODE: region.naldRegionId
    })

    Sinon.stub(FetchLegacyImportLicenceVersionsService, 'go').resolves([...FixtureVersions])
  })

  it('returns the matching licence data', async () => {
    const results = await LegacyLicenceService.go(licenceRef)

    const licence = await LicenceModel.query().findById(results.id)

    expect(results).to.equal({
      expiredDate: '2015-03-31',
      id: licence.id,
      lapsedDate: null,
      licenceRef,
      regionId: region.id,
      regions: {
        historicalAreaCode: 'RIDIN',
        localEnvironmentAgencyPlanCode: 'AIREL',
        regionalChargeArea: 'Yorkshire',
        standardUnitChargeCode: 'YORKI'
      },
      revokedDate: null,
      startDate: '2005-06-03',
      updatedAt: licence.updatedAt.toISOString(),
      waterUndertaker: false
    })
  })
})
