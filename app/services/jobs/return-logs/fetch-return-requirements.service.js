'use strict'

/**
 * Fetches data needed for generating return logs
 * @module FetchReturnRequirementsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')

const { db } = require('../../../../db/db.js')

/**
 * Fetch all return requirements that need return logs created in the provided return cycle.
 *
 * @param {object} returnCycle - the return cycle
 * @param {string} licenceReference - if provided only do the return log for that licence reference
 *
 * @returns {Promise<Array>} the list of return requirement ids
 */
async function go(returnCycle, licenceReference) {
  return _fetchReturnRequirements(returnCycle, licenceReference)
}

async function _fetchExternalIds(returnCycleId) {
  const externalIds = await ReturnLogModel.query()
    .select([db.raw("concat(metadata->'nald'->>'regionCode', ':', return_reference) as externalid")])
    .whereNot('status', 'void')
    .where('returnCycleId', returnCycleId)

  const externalIdsArray = externalIds.map((item) => {
    return item.externalid
  })

  return externalIdsArray
}

async function _fetchReturnRequirements(returnCycle, licenceReference) {
  const _cycleEndDate = returnCycle.endDate
  const _cycleStartDate = returnCycle.startDate
  const externalIds = await _fetchExternalIds(returnCycle.id)

  return ReturnRequirementModel.query()
    .select([
      'id',
      'returnVersionId',
      'summer',
      'upload',
      'abstractionPeriodStartDay',
      'abstractionPeriodStartMonth',
      'abstractionPeriodEndDay',
      'abstractionPeriodEndMonth',
      'siteDescription',
      'legacyId',
      'externalId',
      'reportingFrequency',
      'twoPartTariff'
    ])
    .whereNotIn('returnRequirements.externalId', externalIds)
    .whereExists(_whereExistsClause(licenceReference, _cycleStartDate, _cycleEndDate))
    .where('returnRequirements.summer', returnCycle.summer)
    .withGraphFetched('returnVersion')
    .modifyGraph('returnVersion', (builder) => {
      builder.select(['endDate', 'id', 'startDate', 'reason'])
    })
    .withGraphFetched('returnVersion.licence')
    .modifyGraph('returnVersion.licence', (builder) => {
      builder.select([
        'expiredDate',
        'id',
        'lapsedDate',
        'licenceRef',
        'revokedDate',
        db.raw("regions->>'historicalAreaCode' as areacode")
      ])
    })
    .withGraphFetched('returnVersion.licence.region')
    .modifyGraph('returnVersion.licence.region', (builder) => {
      builder.select(['id', 'naldRegionId'])
    })
    .withGraphFetched('points')
    .modifyGraph('points', (builder) => {
      builder.select(['points.description', 'points.ngr1', 'points.ngr2', 'points.ngr3', 'points.ngr4'])
    })
    .withGraphFetched('returnRequirementPurposes.primaryPurpose')
    .modifyGraph('returnRequirementPurposes.primaryPurpose', (builder) => {
      builder.select(['legacyId', 'description'])
    })
    .withGraphFetched('returnRequirementPurposes.secondaryPurpose')
    .modifyGraph('returnRequirementPurposes.secondaryPurpose', (builder) => {
      builder.select(['legacyId', 'description'])
    })
    .withGraphFetched('returnRequirementPurposes.purpose')
    .modifyGraph('returnRequirementPurposes.purpose', (builder) => {
      builder.select(['legacyId', 'description'])
    })
}

function _whereExistsClause(licenceReference, cycleStartDate, cycleEndDate) {
  const query = ReturnVersionModel.query().select(1)

  query
    .select(1)
    .innerJoinRelated('licence')
    .where('returnVersions.startDate', '<=', cycleEndDate)
    .where('returnVersions.status', 'current')
    .where((builder) => {
      builder.whereNull('returnVersions.endDate').orWhere('returnVersions.endDate', '>=', cycleStartDate)
    })
    .where((builder) => {
      builder.whereNull('licence.expiredDate').orWhere('licence.expiredDate', '>=', cycleStartDate)
    })
    .where((builder) => {
      builder.whereNull('licence.lapsedDate').orWhere('licence.lapsedDate', '>=', cycleStartDate)
    })
    .where((builder) => {
      builder.whereNull('licence.revokedDate').orWhere('licence.revokedDate', '>=', cycleStartDate)
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
