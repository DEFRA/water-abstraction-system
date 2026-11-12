/**
 * @module ViewLicencesFixture
 */

import LicenceModel from 'water-abstraction-engine/models/licence.model.js'
import LicenceVersionModel from 'water-abstraction-engine/models/licence-version.model.js'
import PointModel from 'water-abstraction-engine/models/point.model.js'
import { generateLicenceRef, generateUUID } from 'water-abstraction-engine/test/generators.js'

/**
 * Represents a licence condition
 *
 * @returns {object} - licence condition
 **/
function condition() {
  return {
    description: 'Cessation Condition',
    displayTitle: 'Political cessation condition',
    id: generateUUID(),
    licenceVersionPurposeConditions: [
      {
        id: generateUUID(),
        licenceVersionPurpose: {
          id: generateUUID(),
          licenceVersionPurposePoints: [
            {
              id: generateUUID(),
              point: point()
            }
          ],
          purpose: {
            description: 'Animal Watering & General Use In Non Farming Situations',
            id: generateUUID()
          }
        },
        notes: 'DROUGHT CONDITION',
        param1: '01/05',
        param2: '30/09'
      }
    ],
    param1Label: 'Start date',
    param2Label: 'End date',
    subcodeDescription: 'Political - Hosepipe Ban'
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
    includeInPresrocBilling: 'no',
    includeInSrocBilling: false,
    includeInTwoPartTariffBilling: true,
    licenceRef: generateLicenceRef(),
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
    criticalityCode: 'LC',
    criticalityDescription: 'Less Critical',
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
        note: 'Whole licence trade',
        reasonDescription: 'Licence Holder Name/Address Change',
        userId: 'JOBSWORTH01'
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
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 10,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    annualQuantity: 180000,
    dailyQuantity: 720,
    hourlyQuantity: 144,
    id: generateUUID(),
    instantQuantity: 40,
    licenceVersionPurposePoints: [
      {
        abstractionMethod: 'Unspecified Pump'
      }
    ],
    points: [
      PointModel.fromJson({
        description: null,
        id: generateUUID(),
        ngr1: 'TL 23198 88603',
        ngr2: null,
        ngr3: null,
        ngr4: null,
        source: {
          description: 'SURFACE WATER SOURCE OF SUPPLY',
          id: generateUUID()
        }
      })
    ],
    purpose: {
      description: 'Spray Irrigation - Storage',
      id: generateUUID()
    }
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
    hydroOffsetDistance: 5.56,
    hydroReference: 'TL 14/133',
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
    hydroOffsetDistance: 5.56,
    hydroReference: 'TL 14/133',
    id: generateUUID(),
    locationNote: 'Castle Farm, The Loke, Gresham, Norfolk',
    ngr1: 'SD 963 193',
    ngr2: 'SD 963 193',
    ngr3: 'SD 963 193',
    ngr4: 'SD 963 193',
    note: 'WELL IS SPRING-FED',
    primaryType: 'Groundwater',
    secondaryType: 'Borehole',
    source: { description: 'SURFACE WATER SOURCE OF SUPPLY', sourceType: 'Borehole' },
    wellReference: '81312'
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
