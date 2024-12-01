'use strict'

/**
 * Generates the payload for submission to the returns table.
 * @module GenerateReturnLogService
 */

const { determineEarliestDate } = require('../../lib/dates.lib.js')
const { cycleEndDate } = require('../../lib/return-cycle-dates.lib.js')
const { formatDateObjectToISO } = require('../../lib/dates.lib.js')

/**
 * Generates the payload for submission to the returns table.
 *
 * @param {object} returnRequirement - the return requirement to have a return log created for
 * @param {object} returnCycle - the return cycle details
 *
 * @returns {Promise<object>} the return log payload
 */
async function go(returnRequirement, returnCycle) {
  const startDate = _startDate(returnRequirement.returnVersion.startDate, returnCycle.startDate)
  const endDate = _endDate(returnRequirement.returnVersion, returnCycle.endDate)
  const id = _id(returnRequirement, startDate, endDate)
  const metadata = await _metadata(returnRequirement.summer, endDate, returnRequirement)

  return {
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: returnCycle.dueDate,
    endDate,
    id,
    licenceRef: returnRequirement.returnVersion.licence.licenceRef,
    metadata,
    returnCycleId: returnCycle.id,
    returnsFrequency: returnRequirement.reportingFrequency,
    returnReference: returnRequirement.legacyId.toString(),
    startDate,
    status: 'due',
    source: 'WRLS'
  }
}

function _endDate(returnVersion, returnCycleEndDate) {
  const earliestDate = determineEarliestDate([
    returnVersion.licence.expiredDate,
    returnVersion.licence.lapsedDate,
    returnVersion.licence.revokedDate,
    returnVersion.endDate,
    returnCycleEndDate
  ])

  return formatDateObjectToISO(earliestDate)
}

function _id(requirements, startDate, endDate) {
  const regionCode = requirements.returnVersion.licence.region.naldRegionId
  const licenceReference = requirements.returnVersion.licence.licenceRef
  const legacyId = requirements.legacyId

  return `v1:${regionCode}:${licenceReference}:${legacyId}:${startDate}:${endDate}`
}

function _isFinal(endDateString, summer) {
  const endDate = new Date(endDateString)

  return endDate < cycleEndDate(summer)
}

async function _metadata(summer, endDate, requirements) {
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

function _startDate(returnVersionStartDate, returnCycleStartDate) {
  const _returnVersionStartDate = new Date(returnVersionStartDate)
  const _returnCycleStartDate = new Date(returnCycleStartDate)

  if (_returnVersionStartDate > _returnCycleStartDate) {
    return formatDateObjectToISO(_returnVersionStartDate)
  }

  return formatDateObjectToISO(_returnCycleStartDate)
}

module.exports = {
  go
}
