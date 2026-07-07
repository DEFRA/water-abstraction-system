/**
 * @module ViewLicencesFixture
 */

import LicenceModel from '../../../app/models/licence.model.js'
import LicenceVersionModel from '../../../app/models/licence-version.model.js'
import PointModel from '../../../app/models/point.model.js'
import { generateLicenceRef } from '../helpers/licence.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

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
    licenceRef: generateLicenceRef(),
    includeInPresrocBilling: 'no',
    includeInSrocBilling: false,
    includeInTwoPartTariffBilling: true,
    licenceVersions: [
      {
        id: generateUUID(),
        startDate: new Date('2022-05-01'),
        status: 'current'
      }
    ]
  })
}

/**
 * Represents a licence version
 *
 * @returns {object} - licence version
 */
function licenceVersion() {
  return LicenceVersionModel.fromJson({
    address: {
      address1: '12 GRIMMAULD PLACE',
      address2: 'ISLINGTON',
      address3: 'LONDON',
      address4: 'GREATER LONDON',
      address5: null,
      address6: null,
      country: 'UNITED KINGDOM',
      id: generateUUID(),
      postcode: 'N1 9LX'
    },
    administrative: null,
    applicationNumber: null,
    company: {
      id: generateUUID(),
      name: 'ORDER OF THE PHOENIX'
    },
    createdAt: new Date('2022-01-01'),
    endDate: null,
    id: generateUUID(),
    issueDate: null,
    licence: {
      id: generateUUID(),
      licenceRef: generateLicenceRef()
    },
    licenceVersionPurposes: [],
    modLogs: [
      {
        id: generateUUID(),
        reasonDescription: 'Licence Holder Name/Address Change',
        userId: 'JOBSWORTH01',
        note: 'Whole licence trade'
      }
    ],
    startDate: new Date('2022-01-01')
  })
}

/**
 * Represents a licence version purpose
 *
 * @returns {object} - licence version purpose
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
    wellReference: '81312'
  })
}

/**
 * Represents a licence point with the source.
 *
 * Spreading a model instance (e.g. `{ ...model }`) converts it into a plain
 * object and **does not preserve the prototype chain**.
 *
 * As a result, any methods defined on the model class (such as `$describe()`)
 * are lost, because object spread only copies enumerable own properties,
 * not prototype methods.
 *
 * To keep model methods available, always construct the model *after*
 * merging properties (e.g. using `PointModel.fromJson()`), and avoid
 * spreading class instances directly.
 *
 * @returns {PointModel} - licence point
 **/
function pointWithSource() {
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
    source: { description: 'SURFACE WATER SOURCE OF SUPPLY', sourceType: 'Borehole' }
  })
}

/**
 * Represents a licence purpose
 *
 * @returns {object} - licence purpose
 */
function purpose() {
  return {
    description: 'Spray Irrigation - Storage'
  }
}

export default {
  condition,
  licence,
  licenceVersion,
  licenceVersionPurpose,
  point,
  pointWithSource,
  purpose
}
