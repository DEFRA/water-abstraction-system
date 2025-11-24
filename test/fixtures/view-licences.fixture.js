'use strict'

/**
 * @module ViewLicencesFixture
 */

const LicenceModel = require('../../app/models/licence.model.js')
const PointModel = require('../../app/models/point.model.js')
const { generateLicenceRef } = require('../support/helpers/licence.helper.js')
const { generateUUID } = require('../../app/lib/general.lib.js')

/**
 * Represents a licence condition
 *
 * @returns {object} - licence condition
 **/
function condition() {
  return {
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
              point: point()
            }
          ]
        }
      }
    ]
  }
}

/**
 * Represents a licence
 *
 * @returns {LicenceModel} - licence
 **/
function licence() {
  return LicenceModel.fromJson({
    id: generateUUID(),
    licenceRef: generateLicenceRef()
  })
}

/**
 * Represents a licence version purpose
 *
 * @returns {object} - licence
 **/
function licenceVersionPurpose() {
  return {
    id: generateUUID(),
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 10,
    annualQuantity: 180000,
    dailyQuantity: 720,
    hourlyQuantity: 144,
    instantQuantity: 40,
    licenceVersionPurposePoints: [
      {
        abstractionMethod: 'Unspecified Pump'
      }
    ],
    purpose: {
      id: generateUUID(),
      description: 'Spray Irrigation - Storage'
    },
    points: [
      PointModel.fromJson({
        id: generateUUID(),
        description: null,
        ngr1: 'TL 23198 88603',
        ngr2: null,
        ngr3: null,
        ngr4: null,
        source: {
          id: generateUUID(),
          description: 'SURFACE WATER SOURCE OF SUPPLY'
        }
      })
    ]
  }
}

/**
 * Represents a licence point
 *
 * @returns {PointModel} - licence point
 **/
function point() {
  return PointModel.fromJson({
    bgsReference: 'TL 14/123',
    category: 'Single Point',
    depth: 123,
    description: 'RIVER OUSE AT BLETSOE',
    hydroInterceptDistance: 8.01,
    hydroReference: 'TL 14/133',
    hydroOffsetDistance: 5.56,
    id: generateUUID(),
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
}

module.exports = {
  condition,
  licence,
  licenceVersionPurpose,
  point
}
