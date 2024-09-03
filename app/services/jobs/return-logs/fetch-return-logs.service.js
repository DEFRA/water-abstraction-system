'use strict'

/**
 * Fetches data needed for the generating return logs
 * @module FetchLicenceWithoutReturnsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')

const { db } = require('../../../../db/db.js')

const allYearDueDateDay = 28
const allYearDueDateMonth = 3
const allYearEndDay = 31
const allYearEndMonth = 2
const allYearStartDay = 1
const allYearStartMonth = 3

const summerDueDateDay = 28
const summerDueDateMonth = 10
const summerEndDay = 31
const summerEndMonth = 9
const summerStartDay = 1
const summerStartMonth = 10

const endOfSummerCycle = new Date(new Date().getFullYear() + 1, summerEndMonth, summerEndDay)
const endOfWinterAndAllYearCycle = new Date(new Date().getFullYear() + 1, allYearEndMonth, allYearEndDay)

/**
 * Fetch all return requirements that need return logs created.
 *
 * @param {boolean} isSummer - are we running summer cycel or all year
 * @param {string} licenceReference - if provided only do the return log for that licence reference
 * @returns {Promise<Array>} the list of return requirement ids
 */
async function go (isSummer, licenceReference) {
  const requirementsForReturns = await _fetchReturnRequirements(isSummer, licenceReference)
  const data = await _generateReturnLogPayload(isSummer, requirementsForReturns)

  return data
}

async function _createMetaData (isSummer, endDate, requirements) {
  return {
    description: requirements.siteDescription,
    isCurrent: requirements.returnVersion.reason !== 'succession-or-transfer-of-licence',
    isFinal: _isFinal(endDate, isSummer),
    isSummer,
    isTwoPartTariff: requirements.twoPartTariff,
    isUpload: requirements.upload,
    nald: {
      regionCode: requirements.returnVersion.licence.region.naldRegionId,
      areaCode: requirements.returnVersion.licence.areacode,
      formatId: requirements.legacyId,
      periodStartDay: requirements.abstractionPeriodStartDay,
      periodStartMonth: requirements.abstractionPeriodStartMonth,
      periodEndDay: requirements.abstractionPeriodEndDay,
      periodEndMonth: requirements.abstractionPeriodEndMonth
    },
    points: requirements.returnRequirementPoints,
    purposes: requirements.returnRequirementPurposes,
    version: 1
  }
}

function _createReturnLogId (requirements, startDate, endDate) {
  const regionCode = requirements.returnVersion.licence.region.naldRegionId
  const licenceReference = requirements.returnVersion.licence.licenceRef
  const legacyId = requirements.legacyId

  return `v1:${regionCode}:${licenceReference}:${legacyId}:${startDate}:${endDate}`
}

async function _fetchExternalIds (cycleStartDate) {
  const externalIds = await ReturnLogModel.query()
    .select(['licenceRef',
      db.raw("concat(ret.metadata->'nald'->>'regionCode', ':', ret.return_requirement) as externalid")
    ])
    .from('returns.returns as ret')
    .where('startDate', '>=', cycleStartDate)

  const externalIdsArray = externalIds.map((item) => {
    return item.externalid
  })

  return externalIdsArray
}

async function _fetchReturnRequirements (isSummer, licenceReference) {
  const cycleEndDate = _getCycleEndDate(isSummer)
  const cycleStartDate = _getCycleStartDate(isSummer)
  const externalIds = await _fetchExternalIds(cycleStartDate)

  const results = await ReturnRequirementModel.query()
    .whereNotIn('returnRequirements.externalId', externalIds)
    .whereExists(_whereExistsClause(licenceReference, cycleStartDate, cycleEndDate))
    .where('returnRequirements.summer', isSummer)
    .withGraphFetched('returnVersion')
    .modifyGraph('returnVersion', (builder) => {
      builder.select(['endDate',
        'id',
        'startDate',
        'reason'])
    })
    .withGraphFetched('returnVersion.licence')
    .modifyGraph('returnVersion.licence', (builder) => {
      builder.select(['expiredDate',
        'id',
        'lapsedDate',
        'licenceRef',
        'revokedDate',
        db.raw('regions->>\'historicalAreaCode\' as areacode')])
    })
    .withGraphFetched('returnVersion.licence.region')
    .modifyGraph('returnVersion.licence.region', (builder) => {
      builder.select(['id', 'naldRegionId'])
    })
    .withGraphFetched('returnRequirementPoints')
    .withGraphFetched('returnRequirementPurposes')

  return results
}

function _formatDate (date) {
  return date.toISOString().split('T')[0]
}

async function _generateReturnLogPayload (isSummer, requirementsForReturns) {
  const returnLogs = requirementsForReturns.map(async (requirements) => {
    const startDate = _getStartDate(isSummer, requirements.returnVersion)
    const endDate = _getLicenceEndDate(isSummer, requirements.returnVersion)
    const id = _createReturnLogId(requirements, startDate, endDate)
    const metadata = await _createMetaData(isSummer, endDate, requirements)

    return {
      createdAt: new Date(),
      dueDate: _getCycleDueDate(isSummer),
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

function _getCycleDueDate (isSummer) {
  return isSummer
    ? _formatDate(new Date(new Date().getFullYear() + 1, summerDueDateMonth, summerDueDateDay))
    : _formatDate(new Date(new Date().getFullYear() + 1, allYearDueDateMonth, allYearDueDateDay))
}

function _getLicenceEndDate (isSummer, returnVersion) {
  const dates = [returnVersion.licence.expiredDate,
    returnVersion.licence.lapsedDate,
    returnVersion.licence.revokedDate,
    returnVersion.endDate]
    .filter((date) => { return date !== null })
    .map((date) => { return new Date(date) })

  if (dates.length === 0) {
    return isSummer
      ? _formatDate(endOfSummerCycle)
      : _formatDate(endOfWinterAndAllYearCycle)
  }

  dates.map((date) => { return date.getTime() })
  const earliestEndDate = new Date(Math.min(...dates))

  if (isSummer) {
    if (earliestEndDate < endOfSummerCycle) {
      return _formatDate(earliestEndDate)
    }

    return _formatDate(endOfSummerCycle)
  }

  if (earliestEndDate < endOfWinterAndAllYearCycle) {
    return _formatDate(earliestEndDate)
  }

  return _formatDate(endOfWinterAndAllYearCycle)
}

function _getStartDate (isSummer, returnVersion) {
  const startOfSummerCycle = new Date(new Date().getFullYear(), summerStartMonth, summerStartDay)
  const startOfWinterAndAllYear = new Date(new Date().getFullYear(), allYearStartMonth, allYearStartDay)
  const returnVersionStartDate = new Date(returnVersion.startDate)

  if (returnVersionStartDate > startOfSummerCycle) {
    return _formatDate(returnVersionStartDate)
  }

  return isSummer ? _formatDate(startOfSummerCycle) : _formatDate(startOfWinterAndAllYear)
}

function _getCycleStartDate (isSummer) {
  return isSummer
    ? _formatDate(new Date(new Date().getFullYear(), summerStartMonth, summerStartDay))
    : _formatDate(new Date(new Date().getFullYear(), allYearStartMonth, allYearStartDay))
}

function _getCycleEndDate (isSummer) {
  return isSummer ? _formatDate(endOfSummerCycle) : _formatDate(endOfWinterAndAllYearCycle)
}

function _isFinal (endDateString, isSummer) {
  const endDate = new Date(endDateString)

  return ((isSummer && endDate < endOfSummerCycle) || (!isSummer && endDate < endOfWinterAndAllYearCycle))
}

function _whereExistsClause (licenceReference, cycleStartDate, cycleEndDate) {
  const query = ReturnVersionModel.query().select(1)

  query.select(1)
    .innerJoinRelated('licence')
    .where('returnVersions.startDate', '<=', cycleEndDate)
    .where('returnVersions.status', 'current')
    .where((builder) => {
      builder
        .whereNull('returnVersions.endDate')
        .orWhere('returnVersions.endDate', '>=', cycleStartDate)
    })
    .where((builder) => {
      builder
        .whereNull('licence.expiredDate')
        .orWhere('licence.expiredDate', '>=', cycleStartDate)
    })
    .where((builder) => {
      builder
        .whereNull('licence.lapsedDate')
        .orWhere('licence.lapsedDate', '>=', cycleStartDate)
    })
    .where((builder) => {
      builder
        .whereNull('licence.revokedDate')
        .orWhere('licence.revokedDate', '>=', cycleStartDate)
    })

  query.whereColumn('returnVersions.id', 'returnRequirements.returnVersionId')

  if (licenceReference) {
    query.where('licence.licenceRef', licenceReference)
  }

  return query
}

module.exports = {
  go
}
