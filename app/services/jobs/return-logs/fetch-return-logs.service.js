'use strict'

/**
 * Fetches data needed for the generating return logs
 * @module FetchLicenceWithoutReturnsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')

const { db } = require('../../../../db/db.js')

const endOfSummerCycle = new Date(new Date().getFullYear() + 1, 9, 31)
const endOfWinterAndAllYearCycle = new Date(new Date().getFullYear() + 1, 2, 31)

/**
 * Fetch all return requirements that need return logs created.
 *
 * @returns {Promise<Array>} the list of return requirement ids
 */
async function go (isSummer, licenceReference) {
  const requirementsForReturns = await _fetchReturnRequirements(isSummer, licenceReference)
  const data = await _generateReturnLogPayload(isSummer, requirementsForReturns)

  return data
}

async function _createMetaData (isSummer,
  endDate,
  abstractionPeriodStartDay,
  abstractionPeriodStartMonth,
  abstractionPeriodEndDay,
  abstractionPeriodEndMonth,
  areacode,
  isUpload,
  legacyId,
  naldRegionId,
  points,
  purposes,
  siteDescription,
  twoPartTariff,
  reason
) {
  return {
    description: siteDescription,
    isCurrent: reason !== 'succession-or-transfer-of-licence',
    isFinal: _isFinal(endDate, isSummer),
    isSummer,
    isTwoPartTariff: twoPartTariff,
    isUpload,
    nald: {
      regionCode: naldRegionId,
      areaCode: areacode,
      formatId: legacyId,
      periodStartDay: abstractionPeriodStartDay,
      periodStartMonth: abstractionPeriodStartMonth,
      periodEndDay: abstractionPeriodEndDay,
      periodEndMonth: abstractionPeriodEndMonth
    },
    points,
    purposes,
    version: 1
  }
}

function _createReturnLogId (regionCode, licenceReference, legacyId, startDate, endDate) {
  return `v1:${regionCode}:${licenceReference}:${legacyId}:${startDate}:${endDate}`
}

async function _fetchReturnRequirements (isSummer, licenceReference) {
  const cycleStartDate = _getCycleStartDate(isSummer)

  const externalIds = await ReturnLogModel.query()
    .select(['licenceRef',
      db.raw("concat(ret.metadata->'nald'->>'regionCode', ':', ret.return_requirement) as externalid")
    ])
    .from('returns.returns as ret')
    .where('startDate', '>=', cycleStartDate)

  const externalIdsArray = externalIds.map((item) => {
    return item.externalid
  })

  const results = await ReturnRequirementModel.query()
    .whereNotIn('returnRequirements.externalId', externalIdsArray)
    .whereExists(_whereExistsClause(licenceReference, cycleStartDate))
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
    const startDate = _getCycleStartDate(isSummer)
    const endDate = _getCycleEndDate(isSummer,
      requirements.returnVersion.licence.expiredDate,
      requirements.returnVersion.licence.lapsedDate,
      requirements.returnVersion.licence.revokedDate,
      requirements.returnVersion.endDate
    )
    const id = _createReturnLogId(
      requirements.returnVersion.licence.region.naldRegionId,
      requirements.returnVersion.licence.licenceRef,
      requirements.legacyId,
      startDate,
      endDate
    )
    const metadata = await _createMetaData(
      isSummer,
      endDate,
      requirements.abstractionPeriodStartDay,
      requirements.abstractionPeriodStartMonth,
      requirements.abstractionPeriodEndDay,
      requirements.abstractionPeriodEndMonth,
      requirements.returnVersion.licence.areacode,
      requirements.upload,
      requirements.legacyId,
      requirements.returnVersion.licence.region.naldRegionId,
      requirements.returnRequirementPoints,
      requirements.returnRequirementPurposes,
      requirements.siteDescription,
      requirements.twoPartTariff,
      requirements.returnVersion.reason
    )

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
    ? _formatDate(new Date(new Date().getFullYear() + 1, 10, 28))
    : _formatDate(new Date(new Date().getFullYear() + 1, 3, 28))
}

function _getCycleEndDate (isSummer, licenceEndDate, licenceLapsedDate, licenceRevokedDate, returnVersionEndDate) {
  const dates = [licenceEndDate, licenceLapsedDate, licenceRevokedDate, returnVersionEndDate]
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

function _getCycleStartDate (isSummer) {
  return isSummer
    ? _formatDate(new Date(new Date().getFullYear(), 10, 1))
    : _formatDate(new Date(new Date().getFullYear(), 3, 1))
}

function _isFinal (endDateString, isSummer) {
  const endDate = new Date(endDateString)

  if ((isSummer && endDate < endOfSummerCycle) ||
    (!isSummer && endDate < endOfWinterAndAllYearCycle)
  ) {
    return true
  }

  return false
}

function _whereExistsClause (licenceReference, cycleStartDate) {
  const query = ReturnVersionModel.query().select(1)

  query.select(1)
    .innerJoinRelated('licence')
    .where('returnVersions.startDate', '<=', cycleStartDate)
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
