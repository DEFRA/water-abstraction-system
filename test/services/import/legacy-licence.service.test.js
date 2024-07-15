'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const FetchLegacyImportLicenceService = require('../../../app/services/import/legacy-import/fetch-licence.service.js')
const FetchLegacyImportLicenceVersionsService = require('../../../app/services/import/legacy-import/fetch-licence-versions.service.js')
const FixtureLicence = require('./_fixtures/licence.js')
const FixtureVersions = require('./_fixtures/versions.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const LicenceModel = require('../../../app/models/licence.model.js')

// Thing under test
const LegacyImportLicenceService =
  require('../../../app/services/import/legacy-licence.service.js')
const Sinon = require('sinon')

describe('Legacy import licence service', () => {
  const licenceRef = generateLicenceRef()

  let region

  beforeEach(async () => {
    region = await RegionHelper.add()

    Sinon.stub(FetchLegacyImportLicenceService, 'go').resolves({
      ...FixtureLicence,
      LIC_NO: licenceRef,
      FGAC_REGION_CODE: region.naldRegionId
    })

    Sinon.stub(FetchLegacyImportLicenceVersionsService, 'go').resolves([...FixtureVersions])
  })

  it('returns the matching agreements data', async () => {
    const results = await LegacyImportLicenceService.go(licenceRef)

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
