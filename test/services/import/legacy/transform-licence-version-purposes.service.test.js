'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things to stub
const FetchLicenceVersionPurposesService =
  require('../../../../app/services/import/legacy/fetch-licence-version-purposes.service.js')

// Thing under test
const TransformLicenceVersionPurposesService =
  require('../../../../app/services/import/legacy/transform-licence-version-purposes.service.js')

describe('Import Legacy Transform Licence Version Purposes service', () => {
  // NOTE: Clearly this is an incomplete representation of the licence returned from TransformedLicenceService. But for
  // the purposes of this service it is all that is needed. The externalId is used to match the licence version to the
  // fetched purpose
  const transformedLicence = {
    licenceVersions: [{
      externalId: '6:2113:100:0',
      licenceVersionPurposes: []
    }]
  }

  const naldLicenceId = '2113'
  const regionCode = '6'

  let legacyLicenceVersionPurpose

  beforeEach(() => {
    legacyLicenceVersionPurpose = _legacyLicenceVersionPurpose()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a matching valid legacy licence version purpose is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceVersionPurposesService, 'go').resolves([legacyLicenceVersionPurpose])
    })

    it('attaches the record transformed and validated for WRLS to the transformed licence', async () => {
      await TransformLicenceVersionPurposesService.go(regionCode, naldLicenceId, transformedLicence)

      expect(transformedLicence.licenceVersions[0].licenceVersionPurposes[0]).to.equal({
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        annualQuantity: 545520,
        dailyQuantity: 1500.2,
        externalId: '6:10000004',
        hourlyQuantity: 140.929,
        instantQuantity: null,
        licenceVersionPurposeConditions: [],
        notes: null,
        primaryPurposeId: '8d9d407c-3da7-4977-84a0-97738c9b44cc',
        purposeId: '025bfdc9-d7f4-46b5-a7e0-451dec1a34a6',
        secondaryPurposeId: '04bdc9f6-a4e7-41de-831c-9ebf15b92782',
        timeLimitedEndDate: null,
        timeLimitedStartDate: null
      })
    })
  })

  describe('when no matching legacy licence version purpose is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceVersionPurposesService, 'go').resolves(null)
    })

    it('throws an error', async () => {
      await expect(TransformLicenceVersionPurposesService.go(regionCode, naldLicenceId, transformedLicence)).to.reject()
    })
  })

  describe('when the matching legacy licence version purpose is invalid', () => {
    beforeEach(() => {
      legacyLicenceVersionPurpose.abstraction_period_start_day = null

      Sinon.stub(FetchLicenceVersionPurposesService, 'go').resolves([legacyLicenceVersionPurpose])
    })

    it('throws an error', async () => {
      await expect(TransformLicenceVersionPurposesService.go(regionCode, naldLicenceId, transformedLicence)).to.reject()
    })
  })

  describe('when the matching legacy licence version purpose does not match any licence versions', () => {
    beforeEach(() => {
      legacyLicenceVersionPurpose.version_external_id = '6:100023:100:0'

      Sinon.stub(FetchLicenceVersionPurposesService, 'go').resolves([legacyLicenceVersionPurpose])
    })

    it('throws an error', async () => {
      await expect(TransformLicenceVersionPurposesService.go(regionCode, naldLicenceId, transformedLicence)).to.reject()
    })
  })
})

function _legacyLicenceVersionPurpose () {
  return {
    abstraction_period_end_day: 31,
    abstraction_period_end_month: 3,
    abstraction_period_start_day: 1,
    abstraction_period_start_month: 4,
    annual_quantity: 545520,
    daily_quantity: 1500.2,
    external_id: '6:10000004',
    hourly_quantity: 140.929,
    instant_quantity: null,
    notes: null,
    primary_purpose_id: '8d9d407c-3da7-4977-84a0-97738c9b44cc',
    purpose_id: '025bfdc9-d7f4-46b5-a7e0-451dec1a34a6',
    secondary_purpose_id: '04bdc9f6-a4e7-41de-831c-9ebf15b92782',
    time_limited_end_date: null,
    time_limited_start_date: null,
    version_external_id: '6:2113:100:0'
  }
}
