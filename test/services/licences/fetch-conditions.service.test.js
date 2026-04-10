'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../../support/helpers/licence-version-purpose-condition-type.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposePointHelper = require('../../support/helpers/licence-version-purpose-point.helper.js')
const PointHelper = require('../../support/helpers/point.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const FetchConditionsService = require('../../../app/services/licences/fetch-conditions.service.js')

describe('Licences - Fetch Conditions service', () => {
  let licence
  let licenceVersion
  let licenceVersionPurpose
  let licenceVersionPurposeCondition
  let licenceVersionPurposeConditionType
  let licenceVersionPurposePoint
  let point
  let purpose

  beforeEach(async () => {
    licence = await LicenceHelper.add()

    licenceVersion = await LicenceVersionHelper.add({ licenceId: licence.id })

    purpose = PurposeHelper.select()

    licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
      licenceVersionId: licenceVersion.id,
      purposeId: purpose.id
    })

    licenceVersionPurposeConditionType = await LicenceVersionPurposeConditionTypeHelper.select()

    point = await PointHelper.add({
      bgsReference: 'TL 14/123',
      category: 'Single Point',
      depth: 123,
      description: 'RIVER OUSE AT BLETSOE',
      hydroInterceptDistance: 8.01,
      hydroReference: 'TL 14/133',
      hydroOffsetDistance: 5.56,
      locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
      ngr1: 'SD 963 193',
      ngr2: 'SD 963 193',
      ngr3: 'SD 963 193',
      ngr4: 'SD 963 193',
      note: 'WELL IS SPRING-FED',
      primaryType: 'Groundwater',
      secondaryType: 'Borehole',
      wellReference: '81312'
    })

    licenceVersionPurposePoint = await LicenceVersionPurposePointHelper.add({
      licenceVersionPurposeId: licenceVersionPurpose.id,
      pointId: point.id
    })
  })

  afterEach(async () => {
    await licence.$query().delete()
    await licenceVersion.$query().delete()
    await licenceVersionPurpose.$query().delete()
    await licenceVersionPurposePoint.$query().delete()
  })

  describe('when the licence has licence versions, licence version purposes, conditions and condition types', () => {
    beforeEach(async () => {
      licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        licenceVersionPurposeConditionTypeId: licenceVersionPurposeConditionType.id
      })
    })

    it('return the matching conditions', async () => {
      const result = await FetchConditionsService.go(licenceVersion.id)

      expect(result).to.equal([
        {
          id: licenceVersionPurposeConditionType.id,
          displayTitle: licenceVersionPurposeConditionType.displayTitle,
          description: licenceVersionPurposeConditionType.description,
          subcodeDescription: licenceVersionPurposeConditionType.subcodeDescription,
          param1Label: licenceVersionPurposeConditionType.param1Label,
          param2Label: licenceVersionPurposeConditionType.param2Label,
          licenceVersionPurposeConditions: [
            {
              id: licenceVersionPurposeCondition.id,
              param1: licenceVersionPurposeCondition.param1,
              param2: licenceVersionPurposeCondition.param2,
              notes: licenceVersionPurposeCondition.notes,
              licenceVersionPurpose: {
                id: licenceVersionPurpose.id,
                purpose: {
                  id: purpose.id,
                  description: purpose.description
                },
                licenceVersionPurposePoints: [
                  {
                    id: licenceVersionPurposePoint.id,
                    point: {
                      id: point.id,
                      description: point.description,
                      ngr1: point.ngr1,
                      ngr2: point.ngr2,
                      ngr3: point.ngr3,
                      ngr4: point.ngr4
                    }
                  }
                ]
              }
            }
          ]
        }
      ])
    })
  })

  describe('when the licence has licence versions, licence version purposes, condition types and no conditions', () => {
    beforeEach(async () => {
      licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeId: generateUUID(),
        licenceVersionPurposeConditionTypeId: licenceVersionPurposeConditionType.id
      })
    })

    it('returns no conditions', async () => {
      const result = await FetchConditionsService.go(licenceVersion.id)

      expect(result).to.equal([])
    })
  })
})
