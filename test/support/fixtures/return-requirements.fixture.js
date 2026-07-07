import PointHelper from '../helpers/point.helper.js'
import PrimaryPurposeHelper from '../helpers/primary-purpose.helper.js'
import PurposeHelper from '../helpers/purpose.helper.js'
import RegionHelper from '../helpers/region.helper.js'
import SecondaryPurposeHelper from '../helpers/secondary-purpose.helper.js'
import { generateReference } from '../helpers/return-requirement.helper.js'
import { generateUUID } from '../../../app/lib/general.lib.js'
import { generateLicenceRef } from '../helpers/licence.helper.js'

/**
 * Generates the return log prefix in the format v1:regionCode:licenceRef:reference from a return requirement
 *
 * @param {object} returnRequirement - The return requirement object
 *
 * @returns {string} The formatted return log prefix string
 */
function returnLogPrefix(returnRequirement) {
  const { reference, returnVersion } = returnRequirement

  const licenceRef = returnVersion.licence.licenceRef
  const regionCode = returnVersion.licence.region.naldRegionId

  return `v1:${regionCode}:${licenceRef}:${reference}`
}

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
  const returnVersion = _returnVersion(false)
  const reference = generateReference()

  return {
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 10,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 5,
    externalId: `${returnVersion.licence.region.naldRegionId}:${reference}`,
    id: generateUUID(),
    legacyId: reference,
    reference,
    reportingFrequency: 'day',
    returnVersionId: returnVersion.id,
    siteDescription: 'PUMP AT TINTAGEL',
    summer: true,
    twoPartTariff: false,
    returnVersion,
    points: [_point('Summer cycle - live licence - live return version - summer return requirement')],

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
  const returnVersion = _returnVersion(quarterlyReturns)
  const reference = generateReference()

  return {
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    externalId: `${returnVersion.licence.region.naldRegionId}:${reference}`,
    id: generateUUID(),
    legacyId: reference,
    reference,
    reportingFrequency: 'day',
    returnVersionId: returnVersion.id,
    siteDescription: 'BOREHOLE AT AVALON',
    summer: false,
    twoPartTariff: false,
    returnVersion,
    points: [_point('Winter cycle - live licence - live return version - winter return requirement')],
    returnRequirementPurposes: [_returnRequirementPurpose()]
  }
}

function _point(description) {
  return {
    description,
    ngr1: PointHelper.generateNationalGridReference(),
    ngr2: null,
    ngr3: null,
    ngr4: null
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

function _returnVersion(quarterlyReturns) {
  const region = RegionHelper.select(3)

  return {
    endDate: null,
    id: generateUUID(),
    reason: 'new-licence',
    startDate: new Date('2022-04-01'),
    licence: {
      areacode: 'SAAR',
      expiredDate: null,
      id: generateUUID(),
      lapsedDate: null,
      licenceRef: generateLicenceRef(),
      revokedDate: null,
      region: {
        id: region.id,
        naldRegionId: region.naldRegionId
      },
      startDate: new Date('2022-04-01')
    },
    quarterlyReturns,
    multipleUpload: false
  }
}

export {
  returnLogPrefix,
  summerReturnRequirement,
  winterReturnRequirement
}
export default {
  returnLogPrefix,
  summerReturnRequirement,
  winterReturnRequirement
}
