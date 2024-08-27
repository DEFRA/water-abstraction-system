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
  const transformedLicence = {
    licenceVersions: [{
      externalId: '6:2113:100:0',
      licenceVersionPurposes: [_legacyLicenceVersionPurpose()]
    }]
  }

  const naldLicenceId = '2113'
  const regionCode = '6'

  let legacyLicenceVersionPurposeConditions

  beforeEach(() => {
    legacyLicenceVersionPurposeConditions = _legacyLicenceVersionPurposeCondition()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a matching valid legacy licence version purpose is found', () => {
    beforeEach(() => {
      Sinon.stub(FetchLicenceVersionPurposeConditionsService, 'go').resolves([legacyLicenceVersionPurposeConditions])
    })

    it('attaches the record transformed and validated for WRLS to the transformed licence', async () => {
      await TransformLicenceVersionPurposeConditionsService.go(regionCode, naldLicenceId, transformedLicence)

      expect(transformedLicence.licenceVersions[0].licenceVersionPurposes[0].licenceVersionPurposeConditions[0])
        .to.equal([
          {
            code: 'GW',
            param1: null,
            param2: null,
            notes: 'At each abstraction borehole',
            externalId: '172640:6:10000004'
          }
        ])
    })
  })
})

function _legacyLicenceVersionPurposeCondition () {
  return {
    code: 'GW',
    param1: null,
    param2: null,
    notes: 'At each abstraction borehole',
    purpose_external_id: '6:10000004',
    external_id: '172640:6:10000004'
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
