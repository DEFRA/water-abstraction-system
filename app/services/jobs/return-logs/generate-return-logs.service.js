'use strict'

/**
 * Generates the payload for submission to the returns table.
 * @module GenerateReturnLogService
 */

const {
  endOfSummerCycle,
  endOfWinterAndAllYearCycle,
  formatDateObjectToISO,
  cycleDueDate,
  cycleEndDate,
  cycleStartDate,
  startOfSummerCycle
} = require('../../../lib/dates.lib.js')

/**
 * Generates the payload for submission to the returns table.
 *
 * @param {Array} returnRequirements - the return requirements to be turned into return logs
 *
 * @returns {Promise<Array>} the array of return log payloads to be created in the database
 */
async function go (returnRequirements) {
  const returnLogs = returnRequirements.map(async (requirements) => {
    const startDate = _getStartDate(requirements.summer, requirements.returnVersion)
    const endDate = _getLicenceEndDate(requirements.summer, requirements.returnVersion)
    const id = _createReturnLogId(requirements, startDate, endDate)
    const metadata = await _createMetaData(requirements.summer, endDate, requirements)

    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: cycleDueDate(requirements.summer),
      endDate,
      id,
      licenceRef: requirements.returnVersion.licence.licenceRef,
      metadata,
      returnsFrequency: requirements.reportingFrequency,
      startDate,
      status: 'due',
      source: 'WRLS',
      returnReference: requirements.legacyId.toString()
    }
  })

  const results = await Promise.all(returnLogs)

  return results
}

async function _createMetaData (summer, endDate, requirements) {
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
    points: _createPointsMetaData(requirements.returnRequirementPoints),
    purposes: _createPurposesMetaData(requirements.returnRequirementPurposes),
    version: 1
  }
}

function _createPointsMetaData (returnRequirementPoints) {
  return returnRequirementPoints.map((returnRequirementPoint) => {
    return {
      name: returnRequirementPoint.description,
      ngr1: returnRequirementPoint.ngr1,
      ngr2: returnRequirementPoint.ngr2,
      ngr3: returnRequirementPoint.ngr3,
      ngr4: returnRequirementPoint.ngr4
    }
  })
}

function _createPurposesMetaData (returnRequirementPurposes) {
  return returnRequirementPurposes.map((returnRequirementPurpose) => {
    return {
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

function _createReturnLogId (requirements, startDate, endDate) {
  const regionCode = requirements.returnVersion.licence.region.naldRegionId
  const licenceReference = requirements.returnVersion.licence.licenceRef
  const legacyId = requirements.legacyId

  return `v1:${regionCode}:${licenceReference}:${legacyId}:${startDate}:${endDate}`
}

function _getLicenceEndDate (summer, returnVersion) {
  const dates = [returnVersion.licence.expiredDate,
    returnVersion.licence.lapsedDate,
    returnVersion.licence.revokedDate,
    returnVersion.endDate]
    .filter((date) => { return date !== null })
    .map((date) => { return new Date(date) })

  if (dates.length === 0) {
    return cycleEndDate(summer)
  }

  dates.map((date) => { return date.getTime() })
  const _earliestEndDate = new Date(Math.min(...dates))

  if (summer) {
    const _endOfSummerCycle = endOfSummerCycle()

    if (_earliestEndDate < _endOfSummerCycle) {
      return formatDateObjectToISO(_earliestEndDate)
    }

    return formatDateObjectToISO(_endOfSummerCycle)
  }

  if (_earliestEndDate < endOfWinterAndAllYearCycle()) {
    return formatDateObjectToISO(_earliestEndDate)
  }

  return formatDateObjectToISO(endOfWinterAndAllYearCycle())
}

function _getStartDate (summer, returnVersion) {
  const returnVersionStartDate = new Date(returnVersion.startDate)

  if (returnVersionStartDate > startOfSummerCycle()) {
    return formatDateObjectToISO(returnVersionStartDate)
  }

  return cycleStartDate(summer)
}

function _isFinal (endDateString, summer) {
  const endDate = new Date(endDateString)

  return ((summer && endDate < endOfSummerCycle()) || (!summer && endDate < endOfWinterAndAllYearCycle()))
}

module.exports = {
  go
}
