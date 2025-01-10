'use strict'

const LicenceModel = require('../../app/models/licence.model.js')
const PointModel = require('../../app/models/point.model.js')

/**
 * Represents a complete response from `FetchLicenceConditionsService`
 *
 * @returns {object} an object representing the licence and its related conditions
 */
function licenceConditions() {
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

module.exports = {
  licenceConditions
}
