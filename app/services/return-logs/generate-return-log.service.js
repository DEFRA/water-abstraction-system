'use strict'

/**
 * Generate return log data from a return requirement and return cycle
 * @module GenerateReturnLogService
 */

const { determineEarliestDate, determineLatestDate, formatDateObjectToISO } = require('../../lib/dates.lib.js')
const { determineCycleEndDate } = require('../../lib/return-cycle-dates.lib.js')

const featureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Generate return log data from a return requirement and return cycle
 *
 * @param {module:ReturnRequirement} returnRequirement - the return requirement to generate a return log from
 * @param {module:ReturnCycle} returnCycle - the return cycle for the return log
 *
 * @returns {object} the generated return log data
 */
function go(returnRequirement, returnCycle) {
  const { reference, reportingFrequency, returnVersion } = returnRequirement
  const { dueDate, endDate: returnCycleEndDate, id: returnCycleId, startDate: returnCycleStartDate } = returnCycle

  const startDate = _startDate(returnVersion, returnCycleStartDate)
  const endDate = _endDate(returnVersion, returnCycleEndDate)

  return {
    dueDate: _dueDate(dueDate),
    endDate,
    id: _id(returnVersion, reference, startDate, endDate),
    licenceRef: returnVersion.licence.licenceRef,
    metadata: _metadata(returnRequirement, endDate),
    returnCycleId,
    returnsFrequency: reportingFrequency,
    returnReference: reference.toString(),
    source: 'WRLS',
    startDate,
    status: 'due',
    quarterly: returnRequirement.returnVersion.quarterlyReturns
  }
}

/**
 * Converts the given abstraction value to a string if it exists; otherwise returns 'null'
 *
 * We are required to match how return logs are created by the legacy service (until such time as we have full control
 * of returns!) We have found there are approximately 2K return requirements that were imported from NALD with no
 * abstraction period set.
 *
 * When water-abstraction-import encountered these it would set the period properties in the `metadata.nald` object to
 * the `'null'`. We use this to mirror this behaviour.
 *
 * @param {number|null} value - The abstraction value to be converted
 *
 * @returns {string} The string representation of the value or 'null'
 */

function _abstractionPeriodValue(value) {
  return value ? value.toString() : 'null'
}

function _dueDate(dueDate) {
  if (featureFlagsConfig.enableNullDueDate) {
    return null
  }

  return dueDate
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
function _id(returnVersion, reference, startDate, endDate) {
  const regionCode = returnVersion.licence.region.naldRegionId
  const licenceReference = returnVersion.licence.licenceRef
  const startDateAsString = formatDateObjectToISO(startDate)
  const endDateAsString = formatDateObjectToISO(endDate)

  return `v1:${regionCode}:${licenceReference}:${reference}:${startDateAsString}:${endDateAsString}`
}

function _metadata(returnRequirement, endDate) {
  const {
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    points,
    reference,
    returnRequirementPurposes,
    returnVersion,
    siteDescription,
    summer,
    twoPartTariff
  } = returnRequirement

  return {
    description: siteDescription,
    isCurrent: returnVersion.reason !== 'succession-or-transfer-of-licence',
    isFinal: endDate < determineCycleEndDate(summer),
    isSummer: summer,
    isTwoPartTariff: twoPartTariff,
    isUpload: returnVersion.multipleUpload,
    nald: {
      regionCode: returnVersion.licence.region.naldRegionId,
      areaCode: returnVersion.licence.areacode,
      formatId: reference,
      periodStartDay: _abstractionPeriodValue(abstractionPeriodStartDay),
      periodStartMonth: _abstractionPeriodValue(abstractionPeriodStartMonth),
      periodEndDay: _abstractionPeriodValue(abstractionPeriodEndDay),
      periodEndMonth: _abstractionPeriodValue(abstractionPeriodEndMonth)
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
