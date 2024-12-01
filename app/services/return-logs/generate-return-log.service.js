'use strict'

/**
 * Generate return log data from a return requirement and return cycle
 * @module GenerateReturnLogService
 */

const { determineEarliestDate, determineLatestDate, formatDateObjectToISO } = require('../../lib/dates.lib.js')
const { cycleEndDate } = require('../../lib/return-cycle-dates.lib.js')

/**
 * Generate return log data from a return requirement and return cycle
 *
 * @param {module:ReturnRequirement} returnRequirement - the return requirement to generate a return log from
 * @param {module:ReturnCycle} returnCycle - the return cycle for the return log
 *
 * @returns {object} the generated return log data
 */
function go(returnRequirement, returnCycle) {
  const { legacyId, reportingFrequency: returnsFrequency, returnVersion, summer } = returnRequirement
  const { dueDate, endDate: returnCycleEndDate, id: returnCycleId, startDate: returnCycleStartDate } = returnCycle

  const startDate = _startDate(returnVersion, returnCycleStartDate)
  const endDate = _endDate(returnVersion, returnCycleEndDate)
  const id = _id(returnRequirement, startDate, endDate)
  const metadata = _metadata(summer, endDate, returnRequirement)

  return {
    dueDate,
    endDate,
    id,
    licenceRef: returnVersion.licence.licenceRef,
    metadata,
    returnCycleId,
    returnsFrequency,
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

function _id(requirements, startDate, endDate) {
  const regionCode = requirements.returnVersion.licence.region.naldRegionId
  const licenceReference = requirements.returnVersion.licence.licenceRef
  const legacyId = requirements.legacyId

  return `v1:${regionCode}:${licenceReference}:${legacyId}:${formatDateObjectToISO(startDate)}:${formatDateObjectToISO(endDate)}`
}

function _isFinal(endDateString, summer) {
  const endDate = new Date(endDateString)

  return endDate < cycleEndDate(summer)
}

function _metadata(summer, endDate, requirements) {
  return {
    description: requirements.siteDescription,
    isCurrent: requirements.returnVersion.reason !== 'succession-or-transfer-of-licence',
    isFinal: _isFinal(endDate, summer),
    isSummer: summer,
    isTwoPartTariff: requirements.twoPartTariff,
    isUpload: requirements.upload,
    nald: {
      regionCode: requirements.returnVersion.licence.region.naldRegionId,
      areaCode: requirements.returnVersion.licence.areacode,
      formatId: requirements.legacyId,
      periodStartDay: requirements.abstractionPeriodStartDay.toString(),
      periodStartMonth: requirements.abstractionPeriodStartMonth.toString(),
      periodEndDay: requirements.abstractionPeriodEndDay.toString(),
      periodEndMonth: requirements.abstractionPeriodEndMonth.toString()
    },
    points: _metadataPoints(requirements.points),
    purposes: _metadataPurposes(requirements.returnRequirementPurposes),
    version: 1
  }
}

function _metadataPoints(points) {
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

function _metadataPurposes(returnRequirementPurposes) {
  return returnRequirementPurposes.map((returnRequirementPurpose) => {
    return {
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
