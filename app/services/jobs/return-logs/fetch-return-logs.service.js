'use strict'

/**
 * Fetches data needed for the generating return logs
 * @module FetchLicenceWithoutReturnsService
 */

const FetchReturnRequirementPointsService = require('./fetch-return-requirement-points.service.js')
const FetchReturnRequirementPurposesService = require('./fetch-return-requirement-purposes.service.js')
const ReturnLogModel = require('../../../models/return-log.model.js')

const { db } = require('../../../../db/db.js')

/**
 * Fetch all return requirements that need return logs created.
 *
 * @returns {Promise<Array>} the list of return requirement ids
 */
async function go (isSummer, licenceReference) {
  const requirementsForReturns = await _fetchReturnRequirements(isSummer, licenceReference)
  const data = await _generateReturnLogPayload(requirementsForReturns)

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
  siteDescritption,
  twoPartTariff,
  reason,
  returnRequirementId
) {
  const points = await FetchReturnRequirementPointsService.go(returnRequirementId)
  const purposes = await FetchReturnRequirementPurposesService.go(returnRequirementId)

  return {
    description: siteDescritption,
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

function _formatDate (date) {
  return date.toISOString().split('T')[0]
}

async function _generateReturnLogPayload (requirementsForReturns, isSummer) {
  const returnLogs = requirementsForReturns.map(async (requirements) => {
    const startDate = _getCycleStartDate(isSummer)
    const endDate = _getCycleEndDate(isSummer,
      requirements.expiredDate,
      requirements.lapsedDate,
      requirements.revokedDate,
      requirements.endDate
    )
    const id = _createReturnLogId(
      requirements.naldRegionId,
      requirements.licenceRef,
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
      requirements.areacode,
      requirements.isUpload,
      requirements.legacyId,
      requirements.naldRegionId,
      requirements.siteDescritption,
      requirements.twoPartTariff,
      requirements.reason,
      requirements.returnRequirementId
    )

    return {
      createdAt: new Date(),
      dueDate: _getCycleDueDate(isSummer),
      endDate,
      id,
      licenceRef: requirements.licenceRef,
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

  const endOfSummerCycle = new Date(new Date().getFullYear() + 1, 9, 31)
  const endOfWinterAndAllYearCycle = new Date(new Date().getFullYear() + 1, 2, 31)

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

function _isFinal (endDate, isSummer) {
  const endOfSummerCycle = new Date(new Date().getFullYear() + 1, 9, 31)
  const endOfWinterAndAllYearCycle = new Date(new Date().getFullYear() + 1, 2, 31)

  if ((isSummer && endDate < endOfSummerCycle) ||
    (!isSummer && endDate < endOfWinterAndAllYearCycle)
  ) {
    return true
  }

  return false
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

  return db.select([
    'r.nald_region_id',
    'l.expired_date',
    'l.lapsed_date',
    'l.licence_ref',
    'l.revoked_date',
    db.raw('l.regions->>\'historicalAreaCode\' as areacode'),
    'rr.return_requirement_id',
    'rr.is_summer',
    'rr.is_upload',
    'rr.abstraction_period_start_day',
    'rr.abstraction_period_start_month',
    'rr.abstraction_period_end_day',
    'rr.abstraction_period_end_month',
    'rr.legacyId',
    'rr.reporting_frequency',
    'rr.site_description',
    'rr.twoPartTariff',
    'rv.end_date',
    'rv.start_date',
    'rv.reason'
  ])
    .from('water.licences AS l')
    .innerJoin('water.regions AS r', 'r.region_id', 'l.region_id')
    .innerJoin('water.return_versions AS rv', 'rv.licence_id', 'l.licence_id')
    .innerJoin('water.return_requirements AS rr', 'rv.return_version_id', 'rr.return_version_id')
    .whereNull('l.lapsed_date')
    .whereNull('l.revoked_date')
    .where('l.start_date', '<=', cycleStartDate)
    .where('rv.status', 'current')
    .where('rv.start_date', '<=', cycleStartDate)
    .where((builder) => {
      builder
        .whereNull('l.expired_date')
        .orWhere('l.expired_date', '>=', cycleStartDate)
    })
    .where((builder) => {
      builder
        .whereNull('rv.end_date')
        .orWhere('rv.end_date', '>=', cycleStartDate)
    })
    .whereNotIn('rr.external_id', externalIdsArray)
    .where('rr.is_summer', isSummer)
    .modify(function (queryBuilder) {
      if (licenceReference) {
        queryBuilder.where('l.licenceRef', licenceReference)
      }
    })
}

module.exports = {
  go
}
