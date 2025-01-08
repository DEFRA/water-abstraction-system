'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceModel = require('../../../app/models/licence.model.js')
const PointModel = require('../../../app/models/point.model.js')

// Things we need to stub
const FetchLicenceConditionsService = require('../../../app/services/licences/fetch-licence-conditions.service.js')

// Thing under test
const ViewLicenceConditionsService = require('../../../app/services/licences/view-licence-conditions.service.js')

describe('View Licence Conditions service', () => {
  beforeEach(() => {
    Sinon.stub(FetchLicenceConditionsService, 'go').returns(_testFetchLicenceConditions())
  })

  it('correctly presents the data', async () => {
    const result = await ViewLicenceConditionsService.go('761bc44f-80d5-49ae-ab46-0a90495417b5')

    expect(result).to.equal({
      activeNavBar: 'search',
      conditionTypes: [
        {
          conditions: [
            {
              abstractionPoints: {
                descriptions: [
                  'Within the area formed by the straight lines running between National Grid References SD 963 193, SD 963 193, SD 963 193 and SD 963 193 (RIVER OUSE AT BLETSOE)'
                ],
                label: 'Abstraction point'
              },
              conditionType: 'Cessation Condition',
              otherInformation: 'DROUGHT CONDITION',
              param1: {
                label: 'Start date',
                value: '01/05'
              },
              param2: {
                label: 'End date',
                value: '30/09'
              },
              purpose: 'Animal Watering & General Use In Non Farming Situations',
              subcodeDescription: 'Political - Hosepipe Ban'
            }
          ],
          displayTitle: 'Political cessation condition'
        }
      ],
      licenceId: '761bc44f-80d5-49ae-ab46-0a90495417b5',
      licenceRef: '01/123',
      pageTitle: 'Licence abstraction conditions'
    })
  })
})

function _testFetchLicenceConditions() {
  const point = PointModel.fromJson({
    bgsReference: 'TL 14/123',
    category: 'Single Point',
    depth: 123,
    description: 'RIVER OUSE AT BLETSOE',
    hydroInterceptDistance: 8.01,
    hydroReference: 'TL 14/133',
    hydroOffsetDistance: 5.56,
    id: 'e225a2a3-7225-4cdd-ad26-61218ba0e1cb',
    locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
    ngr1: 'SD 963 193',
    ngr2: 'SD 963 193',
    ngr3: 'SD 963 193',
    ngr4: 'SD 963 193',
    note: 'WELL IS SPRING-FED',
    primaryType: 'Groundwater',
    secondaryType: 'Borehole',
    wellReference: '81312',
    sourceDescription: 'SURFACE WATER SOURCE OF SUPPLY',
    sourceType: 'Borehole'
  })

  const licence = LicenceModel.fromJson({
    id: '761bc44f-80d5-49ae-ab46-0a90495417b5',
    licenceRef: '01/123'
  })

  return {
    conditions: [
      {
        id: 'c8350eeb-fedd-48ea-bdc2-4f8a01d0f470',
        displayTitle: 'Political cessation condition',
        description: 'Cessation Condition',
        subcodeDescription: 'Political - Hosepipe Ban',
        param1Label: 'Start date',
        param2Label: 'End date',
        licenceVersionPurposeConditions: [
          {
            id: '8a853274-923d-431c-aec4-9208bcd86fd8',
            param1: '01/05',
            param2: '30/09',
            notes: 'DROUGHT CONDITION',
            licenceVersionPurpose: {
              id: 'fd5d9886-ced9-4f19-8995-3194dee9e2a8',
              purpose: {
                id: 'd6e83943-a034-4291-8704-734e5696e6a8',
                description: 'Animal Watering & General Use In Non Farming Situations'
              },
              licenceVersionPurposePoints: [
                {
                  id: '2b35c123-a07e-4b11-a4bf-27099a9ac192',
                  point
                }
              ]
            }
          }
        ]
      }
    ],
    licence
  }
}
