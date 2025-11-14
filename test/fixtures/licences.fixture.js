'use strict'

const LicenceModel = require('../../app/models/licence.model.js')
const PointModel = require('../../app/models/point.model.js')
const { generateLicenceRef } = require('../support/helpers/licence.helper.js')
const { generateUUID } = require('../../app/lib/general.lib.js')

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
    id: generateUUID(),
    licenceRef: generateLicenceRef()
  })

  return {
    conditions: [
      {
        id: generateUUID(),
        displayTitle: 'Political cessation condition',
        description: 'Cessation Condition',
        subcodeDescription: 'Political - Hosepipe Ban',
        param1Label: 'Start date',
        param2Label: 'End date',
        licenceVersionPurposeConditions: [
          {
            id: generateUUID(),
            param1: '01/05',
            param2: '30/09',
            notes: 'DROUGHT CONDITION',
            licenceVersionPurpose: {
              id: generateUUID(),
              purpose: {
                id: generateUUID(),
                description: 'Animal Watering & General Use In Non Farming Situations'
              },
              licenceVersionPurposePoints: [
                {
                  id: generateUUID(),
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
