'use strict'

/**
 * Generate return log data from a return requirement and return cycle
 * @module GenerateReturnLogService
 */

const { determineEarliestDate, determineLatestDate, formatDateObjectToISO } = require('../../lib/dates.lib.js')
const { determineCycleEndDate } = require('../../lib/return-cycle-dates.lib.js')

/**
 * Generate return log data from a return requirement and return cycle
 *
 * @param {module:ReturnRequirement} returnRequirement - the return requirement to generate a return log from
 * @param {module:ReturnCycle} returnCycle - the return cycle for the return log
 *
 * @returns {object} the generated return log data
 */
function go(returnRequirement, returnCycle) {
  const { legacyId, reportingFrequency, returnVersion } = returnRequirement
  const { dueDate, endDate: returnCycleEndDate, id: returnCycleId, startDate: returnCycleStartDate } = returnCycle

  const startDate = _startDate(returnVersion, returnCycleStartDate)
  const endDate = _endDate(returnVersion, returnCycleEndDate)
  const id = _id(returnVersion, legacyId, startDate, endDate)
  const metadata = _metadata(returnRequirement, endDate)

  return {
    dueDate,
    endDate,
    id,
    licenceRef: returnVersion.licence.licenceRef,
    metadata,
    returnCycleId,
    returnsFrequency: reportingFrequency,
    returnReference: legacyId.toString(),
    source: 'WRLS',
    startDate,
    status: 'due'
  }
}

function _endDate(returnVersion, returnCycleEndDate) {
  const { endDate: returnVersionEndDate, licence } = returnVersion

  return determineEarliestDate([
    licence.expiredDate,
    licence.lapsedDate,
    licence.revokedDate,
    returnVersionEndDate,
    returnCycleEndDate
  ])
}

/**
 * For reasons known only to the previous team, the unique identifier for each return log is a mix of references and
 * date values. This function handles that.
 *
 * @private
 */
function _id(returnVersion, legacyId, startDate, endDate) {
  const regionCode = returnVersion.licence.region.naldRegionId
  const licenceReference = returnVersion.licence.licenceRef
  const startDateAsString = formatDateObjectToISO(startDate)
  const endDateAsString = formatDateObjectToISO(endDate)

  return `v1:${regionCode}:${licenceReference}:${legacyId}:${startDateAsString}:${endDateAsString}`
}

function _metadata(returnRequirement, endDate) {
  const {
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    legacyId,
    points,
    returnRequirementPurposes,
    returnVersion,
    siteDescription,
    summer,
    twoPartTariff,
    upload
  } = returnRequirement

  return {
    description: siteDescription,
    isCurrent: returnVersion.reason !== 'succession-or-transfer-of-licence',
    isFinal: endDate < determineCycleEndDate(summer),
    isSummer: summer,
    isTwoPartTariff: twoPartTariff,
    isUpload: upload,
    nald: {
      regionCode: returnVersion.licence.region.naldRegionId,
      areaCode: returnVersion.licence.areacode,
      formatId: legacyId,
      periodStartDay: abstractionPeriodStartDay.toString(),
      periodStartMonth: abstractionPeriodStartMonth.toString(),
      periodEndDay: abstractionPeriodEndDay.toString(),
      periodEndMonth: abstractionPeriodEndMonth.toString()
    },
    points: _points(points),
    purposes: _purposes(returnRequirementPurposes),
    version: 1
  }
}

function _points(points) {
  return points.map((point) => {
    return {
      name: point.description,
      ngr1: point.ngr1,
      ngr2: point.ngr2,
      ngr3: point.ngr3,
      ngr4: point.ngr4
    }
  })
}

function _purposes(returnRequirementPurposes) {
  return returnRequirementPurposes.map((returnRequirementPurpose) => {
    return {
      // NOTE: This is a way of only adding the `alias` property if an alias is set. If one is not set, its not just
      // set to null, instead `alias:` isn't present on the return object
      ...(returnRequirementPurpose.alias !== null && { alias: returnRequirementPurpose.alias }),
      primary: {
        code: returnRequirementPurpose.primaryPurpose.legacyId,
        description: returnRequirementPurpose.primaryPurpose.description
      },
      secondary: {
        code: returnRequirementPurpose.secondaryPurpose.legacyId,
        description: returnRequirementPurpose.secondaryPurpose.description
      },
      tertiary: {
        code: returnRequirementPurpose.purpose.legacyId,
        description: returnRequirementPurpose.purpose.description
      }
    }
  })
}

function _startDate(returnVersion, returnCycleStartDate) {
  const { startDate: returnVersionStartDate, licence } = returnVersion

  return determineLatestDate([licence.startDate, returnVersionStartDate, returnCycleStartDate])
}

module.exports = {
  go
}
