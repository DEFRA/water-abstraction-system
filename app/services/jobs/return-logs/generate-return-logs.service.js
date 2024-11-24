'use strict'

/**
 * Generates the payload for submission to the returns table.
 * @module GenerateReturnLogService
 */

const {
  cycleDueDateAsISO,
  cycleEndDate,
  cycleEndDateAsISO,
  cycleStartDateAsISO,
  cycleStartDate
} = require('../../../lib/return-cycle-dates.lib.js')
const { formatDateObjectToISO } = require('../../../lib/dates.lib.js')
const FetchReturnCycleService = require('./fetch-return-cycle.service.js')
const GenerateReturnCycleService = require('./generate-return-cycle.service.js')

/**
 * Generates the payload for submission to the returns table.
 *
 * @param {Array} returnRequirements - the return requirements to be turned into return logs
 *
 * @returns {Promise<Array>} the array of return log payloads to be created in the database
 */
async function go(returnRequirements) {
  const { allYearReturnCycleId, summerReturnCycleId } = await _fetchReturnCycleIds()

  const returnLogs = returnRequirements.map(async (requirements) => {
    const startDate = _startDate(requirements.summer, requirements.returnVersion)
    const endDate = _endDate(requirements.summer, requirements.returnVersion)
    const id = _id(requirements, startDate, endDate)
    const metadata = await _metadata(requirements.summer, endDate, requirements)

    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: cycleDueDateAsISO(requirements.summer),
      endDate,
      id,
      licenceRef: requirements.returnVersion.licence.licenceRef,
      metadata,
      returnCycleId: requirements.summer ? summerReturnCycleId : allYearReturnCycleId,
      returnsFrequency: requirements.reportingFrequency,
      returnReference: requirements.legacyId.toString(),
      startDate,
      status: 'due',
      source: 'WRLS'
    }
  })

  const results = await Promise.all(returnLogs)

  return results
}

function _endDate(summer, returnVersion) {
  const earliestDate = _earliestDate(summer, returnVersion)

  const _cycleEndDate = cycleEndDate(summer)

  if (earliestDate < _cycleEndDate) {
    return formatDateObjectToISO(earliestDate)
  }

  return cycleEndDateAsISO(summer)
}

function _earliestDate(summer, returnVersion) {
  const dates = [
    returnVersion.licence.expiredDate,
    returnVersion.licence.lapsedDate,
    returnVersion.licence.revokedDate,
    returnVersion.endDate
  ]
    .filter((date) => {
      return date
    })
    .map((date) => {
      return new Date(date)
    })

  if (dates.length === 0) {
    return cycleEndDateAsISO(summer)
  }

  dates.map((date) => {
    return date.getTime()
  })

  return new Date(Math.min(...dates))
}

async function _fetchReturnCycleIds() {
  const today = formatDateObjectToISO(new Date())

  let allYearReturnCycleId = await FetchReturnCycleService.go(today, false)
  let summerReturnCycleId = await FetchReturnCycleService.go(today, true)

  if (!allYearReturnCycleId) {
    allYearReturnCycleId = await GenerateReturnCycleService.go(false)
  }

  if (!summerReturnCycleId) {
    summerReturnCycleId = await GenerateReturnCycleService.go(true)
  }

  return {
    allYearReturnCycleId,
    summerReturnCycleId
  }
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

function _startDate(summer, returnVersion) {
  const returnVersionStartDate = new Date(returnVersion.startDate)

  if (returnVersionStartDate > cycleStartDate(summer)) {
    return formatDateObjectToISO(returnVersionStartDate)
  }

  return cycleStartDateAsISO(summer)
}

module.exports = {
  go
}
