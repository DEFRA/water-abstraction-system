'use strict'

/**
 * Fetches data needed for the generating return logs
 * @module FetchReturnRequirementsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')

const { db } = require('../../../../db/db.js')
const { getCycleEndDate, getCycleStartDate } = require('../../../lib/dates.lib.js')

/**
 * Fetch all return requirements that need return logs created.
 *
 * @param {boolean} isSummer - are we running summer cycle or all year
 * @param {string} licenceReference - if provided only do the return log for that licence reference
 *
 * @returns {Promise<Array>} the list of return requirement ids
 */
async function go (isSummer, licenceReference) {
  const returnRequirements = await _fetchReturnRequirements(isSummer, licenceReference)

  return returnRequirements
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
  const cycleEndDate = getCycleEndDate(isSummer)
  const cycleStartDate = getCycleStartDate(isSummer)
  const externalIds = await _fetchExternalIds(cycleStartDate)

  const results = await ReturnRequirementModel.query()
    .select(['id',
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
    .modifyGraph('returnRequirementPoints', (builder) => {
      builder.select(['description',
        'ngr1',
        'ngr2',
        'ngr3',
        'ngr4'])
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

  return results
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
