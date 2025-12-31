'use strict'

const PrimaryPurposeHelper = require('../support/helpers/primary-purpose.helper.js')
const PurposeHelper = require('../support/helpers/purpose.helper.js')
const SecondaryPurposeHelper = require('../support/helpers/secondary-purpose.helper.js')
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
    returnRequirementPurposes: [_returnRequirementPurpose()]
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
    returnRequirementPurposes: [_returnRequirementPurpose()]
  }
}

function _returnRequirementPurpose() {
  return {
    alias: 'Purpose alias for testing',
    id: generateUUID(),
    primaryPurpose: PrimaryPurposeHelper.select(0),
    purpose: PurposeHelper.select(13),
    secondaryPurpose: SecondaryPurposeHelper.select(0)
  }
}

module.exports = {
  summerReturnRequirement,
  winterReturnRequirement
}
