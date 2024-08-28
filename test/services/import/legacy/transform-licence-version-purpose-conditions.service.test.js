'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things to stub
const FetchLicenceVersionPurposeConditionsService =
  require('../../../../app/services/import/legacy/fetch-licence-version-purpose-conditions.service.js')

// Thing under test
const TransformLicenceVersionPurposeConditionsService =
  require('../../../../app/services/import/legacy/transform-licence-version-purpose-conditions.service.js')

describe('Import Legacy Transform Licence Version Purpose conditions service', () => {
  // NOTE: Clearly this is an incomplete representation of the licence returned from TransformedLicenceService. But for
  // the purposes of this service it is all that is needed. The externalId is used to match the licence version to the
  // fetched purpose
  let transformedLicence

  const naldLicenceId = '2113'
  const regionCode = '6'

  let legacyLicenceVersionPurposeConditions

  beforeEach(() => {
    transformedLicence = {
      licenceVersions: [{
        externalId: '6:2113:100:0',
        licenceVersionPurposes: [_legacyLicenceVersionPurpose()]
      }]
    }

    legacyLicenceVersionPurposeConditions = _legacyLicenceVersionPurposeCondition()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a matching valid legacy licence version purpose condition is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceVersionPurposeConditionsService, 'go').resolves([legacyLicenceVersionPurposeConditions])
    })

    it('attaches the record transformed and validated for WRLS to the transformed licence', async () => {
      await TransformLicenceVersionPurposeConditionsService.go(regionCode, naldLicenceId, transformedLicence)

      expect(transformedLicence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions)
        .to.equal([
          {
            externalId: '172640:6:10000004',
            licenceVersionPurposeConditionTypeId: 'b10cc9d1-d46f-465d-a74a-26b2e567c699',
            notes: 'At each abstraction borehole',
            param1: null,
            param2: null
          }
        ])
    })
  })

  describe('when a matching valid legacy licence version purpose condition for multiple licence purposes is found', () => {
    const externalId = '1:1'

    beforeEach(() => {
      transformedLicence.licenceVersions[0].licenceVersionPurposes
        .push({ ..._legacyLicenceVersionPurpose(), externalId })

      Sinon.stub(FetchLicenceVersionPurposeConditionsService, 'go').resolves([legacyLicenceVersionPurposeConditions,
        { ...legacyLicenceVersionPurposeConditions, purpose_external_id: externalId }])
    })

    it('attaches the record transformed and validated for WRLS to the transformed licence', async () => {
      await TransformLicenceVersionPurposeConditionsService.go(regionCode, naldLicenceId, transformedLicence)

      expect(transformedLicence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions)
        .to.equal([
          {
            externalId: '172640:6:10000004',
            licenceVersionPurposeConditionTypeId: 'b10cc9d1-d46f-465d-a74a-26b2e567c699',
            notes: 'At each abstraction borehole',
            param1: null,
            param2: null
          }
        ])

      expect(transformedLicence.licenceVersions[0].licenceVersionPurposes[1].licenceVersionPurposeConditions)
        .to.equal([
          {
            externalId: '172640:6:10000004',
            licenceVersionPurposeConditionTypeId: 'b10cc9d1-d46f-465d-a74a-26b2e567c699',
            notes: 'At each abstraction borehole',
            param1: null,
            param2: null
          }
        ])
    })
  })

  describe('when a matching valid legacy licence version purpose condition for multiple licence versions is found', () => {
    const externalId = '1:1'

    beforeEach(() => {
      transformedLicence.licenceVersions.push({
        externalId: '6:2113:100:1',
        licenceVersionPurposes: [{ ..._legacyLicenceVersionPurpose(), externalId }]
      })

      Sinon.stub(FetchLicenceVersionPurposeConditionsService, 'go').resolves([legacyLicenceVersionPurposeConditions,
        { ...legacyLicenceVersionPurposeConditions, purpose_external_id: externalId }])
    })

    it('attaches the record transformed and validated for WRLS to the transformed licence', async () => {
      await TransformLicenceVersionPurposeConditionsService.go(regionCode, naldLicenceId, transformedLicence)

      expect(transformedLicence.licenceVersions[1].licenceVersionPurposes[0].licenceVersionPurposeConditions)
        .to.equal(
          [
            {
              externalId: '172640:6:10000004',
              licenceVersionPurposeConditionTypeId: 'b10cc9d1-d46f-465d-a74a-26b2e567c699',
              notes: 'At each abstraction borehole',
              param1: null,
              param2: null
            }
          ]
        )
    })
  })

  describe('when no matching legacy licence version purpose conditions are found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceVersionPurposeConditionsService, 'go').resolves([])
    })

    it('there are no licence version purpose conditions for a licence version purpose', async () => {
      await TransformLicenceVersionPurposeConditionsService.go(regionCode, naldLicenceId, transformedLicence)

      expect(transformedLicence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions)
        .to.equal([])
    })
  })
})

function _legacyLicenceVersionPurposeCondition () {
  return {
    external_id: '172640:6:10000004',
    licence_version_purpose_condition_type_id: 'b10cc9d1-d46f-465d-a74a-26b2e567c699',
    notes: 'At each abstraction borehole',
    param1: null,
    param2: null,
    purpose_external_id: '6:10000004'
  }
}

function _legacyLicenceVersionPurpose () {
  return {
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    annualQuantity: 545520,
    dailyQuantity: 1500.2,
    externalId: '6:10000004',
    hourlyQuantity: 140.929,
    instantQuantity: null,
    notes: null,
    primaryPurposeId: 'd6259e5e-9bb4-4743-b565-e61ec05afc0a',
    purposeId: 'f48f5c29-8231-4552-bb98-3f04234ca6cb',
    secondaryPurposeId: 'f85ab791-e943-4492-a3bb-c0b3ad3f0712',
    timeLimitedEndDate: null,
    timeLimitedStartDate: null,
    licenceVersionPurposeConditions: []
  }
}
