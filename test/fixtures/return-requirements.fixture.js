'use strict'

const { generateUUID } = require('../../app/lib/general.lib.js')

/**
 * Represents a single 'fetch' result for a summer return requirement with associated license and purpose data
 *
 * It represents a result from either `FetchReturnRequirementsService` or `FetchLicenceReturnRequirementsService`
 *
 * It returns a complete return requirement object configured for summer abstraction periods (May 1st to October 31st)
 * with daily reporting frequency. Includes nested objects for return version, license details, points, and return
 * requirement purposes.
 *
 * @returns {object} A summer return requirement fixture object
 */
function summerReturnRequirement() {
  return {
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 10,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 5,
    externalId: '4:16999652',
    id: generateUUID(),
    legacyId: 16999652,
    reference: 16999652,
    reportingFrequency: 'day',
    returnVersionId: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
    siteDescription: 'PUMP AT TINTAGEL',
    summer: true,
    twoPartTariff: false,
    returnVersion: {
      endDate: null,
      id: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
      reason: 'new-licence',
      startDate: new Date('2022-04-01'),
      multipleUpload: false,
      licence: {
        expiredDate: null,
        id: '3acf7d80-cf74-4e86-8128-13ef687ea091',
        lapsedDate: null,
        licenceRef: '01/25/90/3242',
        revokedDate: null,
        areacode: 'SAAR',
        region: {
          id: 'eb57737f-b309-49c2-9ab6-f701e3a6fd96',
          naldRegionId: 4
        }
      },
      quarterlyReturns: false
    },
    points: [
      {
        description: 'Summer cycle - live licence - live return version - summer return requirement',
        ngr1: 'TG 713 291',
        ngr2: null,
        ngr3: null,
        ngr4: null
      }
    ],
    returnRequirementPurposes: [
      {
        alias: 'Purpose alias for testing',
        id: '8a5164fd-1705-45bd-a01c-6b09d066e403',
        primaryPurpose: {
          description: 'Agriculture',
          id: 'b6bb3b77-cfe8-4f22-8dc9-e92713ca3156',
          legacyId: 'A'
        },
        purpose: {
          description: 'General Farming & Domestic',
          id: '289d1644-5215-4a20-af9e-5664fa9a18c7',
          legacyId: '140'
        },
        secondaryPurpose: {
          description: 'General Agriculture',
          id: '2457bfeb-a120-4b57-802a-46494bd22f82',
          legacyId: 'AGR'
        }
      }
    ]
  }
}

/**
 * Represents a single 'fetch' result for a winter all-year return requirement with associated license and purpose data
 *
 * It represents a result from either `FetchReturnRequirementsService` or `FetchLicenceReturnRequirementsService`
 *
 * It returns a complete return requirement object configured for winter and all-year abstraction periods (April 1st to March 31st)
 * with daily reporting frequency. Includes nested objects for return version, license details, points, and return
 * requirement purposes.
 *
 * @param {boolean} [quarterlyReturns=false] - Whether to set the return version to quarterly. Defaults to false
 *
 * @returns {object} A winter all-year return requirement fixture object
 */
function winterReturnRequirement(quarterlyReturns = false) {
  return {
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    externalId: '4:16999651',
    id: generateUUID(),
    legacyId: 16999651,
    reference: 16999651,
    reportingFrequency: 'day',
    returnVersionId: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
    siteDescription: 'BOREHOLE AT AVALON',
    summer: false,
    twoPartTariff: false,
    returnVersion: {
      endDate: null,
      id: '5a077661-05fc-4fc4-a2c6-d84ec908f093',
      reason: 'new-licence',
      startDate: new Date('2022-04-01'),
      licence: {
        expiredDate: null,
        id: '3acf7d80-cf74-4e86-8128-13ef687ea091',
        lapsedDate: null,
        licenceRef: '01/25/90/3242',
        revokedDate: null,
        areacode: 'SAAR',
        region: {
          id: 'eb57737f-b309-49c2-9ab6-f701e3a6fd96',
          naldRegionId: 4
        }
      },
      quarterlyReturns,
      multipleUpload: false
    },
    points: [
      {
        description: 'Winter cycle - live licence - live return version - winter return requirement',
        ngr1: 'TG 713 291',
        ngr2: null,
        ngr3: null,
        ngr4: null
      }
    ],
    returnRequirementPurposes: [
      {
        alias: 'Purpose alias for testing',
        id: '06c4c2f2-3dff-4053-bbc8-e6f64cd39623',
        primaryPurpose: {
          description: 'Agriculture',
          id: 'b6bb3b77-cfe8-4f22-8dc9-e92713ca3156',
          legacyId: 'A'
        },
        purpose: {
          description: 'General Farming & Domestic',
          id: '289d1644-5215-4a20-af9e-5664fa9a18c7',
          legacyId: '140'
        },
        secondaryPurpose: {
          description: 'General Agriculture',
          id: '2457bfeb-a120-4b57-802a-46494bd22f82',
          legacyId: 'AGR'
        }
      }
    ]
  }
}

module.exports = {
  summerReturnRequirement,
  winterReturnRequirement
}
