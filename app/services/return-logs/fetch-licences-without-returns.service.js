'use strict'

/**
 * Fetches data needed for the generating return logs
 * @module FetchLicenceWithoutReturnsService
 */

const FetchReturnRequirementPointsService = require('./fetch-return-requirement-points.service.js')
const LicenceModel = require('../../models/licence.model.js')
const ReturnRequirementModel = require('../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../models/return-version.model.js')
const ReturnLogModel = require('../../models/return-log.model.js')

const { db } = require('../../../db/db.js')
const { ref } = require('objection')

/**
 * Fetch all return requirements that need return logs created.
 *
 * @returns {Promise<Array>} the list of return requirement ids
 */
async function go () {
  const requirementsForReturns = await _fetchReturnRequirements()
  // const licencesWithoutLogs = await _fetchlicencesWithoutLogs(returns)
  const data = await _generateReturnLogColumns(requirementsForReturns)

  return data
}

async function _createMetaData (isSummer,
  abstractionPeriodStartDay,
  abstractionPeriodStartMonth,
  abstractionPeriodEndDay,
  abstractionPeriodEndMonth,
  areacode,
  isUpload,
  legacyId,
  naldRegionId,
  siteDescritption,
  twoPartTarriff,
  reason,
  returnRequirementId
) {
  const points = await FetchReturnRequirementPointsService.go(returnRequirementId)

  return JSON.stringify({
    description: siteDescritption,
    isCurrent: reason !== 'succession-or-transfer-of-licence',
    isSummer,
    isTwoPartTariff: twoPartTarriff,
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
    version: 1
  })
}

function _createReturnLogId (regionCode, licenceReference, legacyId, startDate, endDate) {
  return `v1:${regionCode}:${licenceReference}:${legacyId}:${startDate}:${endDate}`
}

async function _generateReturnLogColumns (requirementsForReturns, isSummer) {
  const returnLogs = requirementsForReturns.map(async (requirements) => {
    const startDate = _getCycleStartDate(isSummer)
    const endDate = _getCycleEndDate(isSummer)
    const id = _createReturnLogId(
      requirements.naldRegionId,
      requirements.licenceRef,
      requirements.legacyId,
      startDate,
      endDate
    )
    const metaData = await _createMetaData(
      isSummer,
      requirements.abstractionPeriodStartDay,
      requirements.abstractionPeriodStartMonth,
      requirements.abstractionPeriodEndDay,
      requirements.abstractionPeriodEndMonth,
      requirements.areacode,
      requirements.isUpload,
      requirements.legacyId,
      requirements.naldRegionId,
      requirements.siteDescritption,
      requirements.twoPartTarriff,
      requirements.reason,
      requirements.returnRequirementId
    )

    console.log(requirements)

    return {
      dueDate: _getCycleDueDate(isSummer),
      endDate,
      id,
      licenceRef: requirements.licenceRef,
      returnsFrequency: requirements.reportingFrequency,
      startDate,
      status: 'due',
      returnReference: requirements.legacyId
    }
  })

  console.log(returnLogs)
}

function _getCycleDueDate (isSummer) {
  return isSummer ? new Date(new Date().getFullYear() + 1, 10, 28) : new Date(new Date().getFullYear() + 1, 3, 28)
}

function _getCycleEndDate (isSummer) {
  return isSummer ? new Date(new Date().getFullYear() + 1, 9, 31) : new Date(new Date().getFullYear() + 1, 2, 31)
}

function _getCycleStartDate (isSummer) {
  return isSummer ? new Date(new Date().getFullYear(), 10, 1) : new Date(new Date().getFullYear(), 3, 1)
}

async function _fetchReturnLogs () {
  const returns = await ReturnLogModel.query()
    .select([
      'licenceRef',
      'returnReference',
      ref('metadata:nald.regionCode').castText().as('regionCode')
    ])
    .where('startDate', '>=', _getCycleStartDate())

  console.log(returns)
}

async function _fetchReturnRequirements () {
  const nextCycleStartDate = _getCycleStartDate()

  const externalIds = await ReturnLogModel.query()
    .select(db.raw("concat(ret.metadata->'nald'->>'regionCode', ':', ret.return_requirement) as externalid"))
    .from('returns.returns as ret')
    .where('startDate', '>=', nextCycleStartDate)

  const externalIdsArray = externalIds.map((item) => {
    return item.externalid
  })

  return db.select([
    'r.nald_region_id',
    'l.licence_ref',
    "l.regions->'historicalAreaCode' as areacode",
    'rr.return_requirement_id',
    'rr.is_summer',
    'rr.is_upload',
    'rr.abstraction_period_start_day',
    'rr.abstraction_period_start_month',
    'rr.abstraction_period_end_day',
    'rr.abstraction_period_end_month',
    'rr.reporting_frequency',
    'rr.site_description',
    'rr.twoPartTarriff',
    'rv.reason'
  ])
    .from('water.licences AS l')
    .innerJoin('water.regions AS r', 'r.region_id', 'l.region_id')
    .innerJoin('water.return_versions AS rv', 'rv.licence_id', 'l.licence_id')
    .innerJoin('water.return_requirements AS rr', 'rv.return_version_id', 'rr.return_version_id')
    .whereNull('l.lapsed_date')
    .whereNull('l.revoked_date')
    .where('rv.status', 'current')
    .where('rv.start_date', '>=', nextCycleStartDate)
    .where((builder) => {
      builder
        .whereNull('l.expired_date')
        .orWhere('l.expired_date', '>=', nextCycleStartDate)
    })
    .where((builder) => {
      builder
        .whereNull('rv.end_date')
        .orWhere('rv.end_date', '>=', nextCycleStartDate)
    })
    .whereNotIn('rr.external_id', externalIdsArray)
}

async function _fetchlicencesWithoutLogs (returnRequirements) {
  const result = await ReturnLogModel.query()
    .whereIn('returnRequirement', returnRequirements)

  return result
}

module.exports = {
  go
}
