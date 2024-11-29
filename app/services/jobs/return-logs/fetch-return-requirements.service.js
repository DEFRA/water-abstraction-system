'use strict'

/**
 * Fetches the matching return requirements for a given return cycle
 * @module FetchReturnRequirementsService
 */

const { db } = require('../../../../db/db.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')

/**
 * Fetches the matching return requirements for a given return cycle
 *
 * @param {module:ReturnCycleModel} returnCycle - the `ReturnCycleModel` to fetch return requirements for
 *
 * @returns {Promise<module:ReturnRequirementModel[]>} the matching return requirements for the given return cycle
 */
async function go(returnCycle) {
  return _fetch(returnCycle)
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

async function _fetch(returnCycle) {
  const externalIds = await _fetchExternalIds(returnCycle.id)

  return ReturnRequirementModel.query()
    .select([
      'abstractionPeriodEndDay',
      'abstractionPeriodEndMonth',
      'abstractionPeriodStartDay',
      'abstractionPeriodStartMonth',
      'externalId',
      'id',
      'legacyId',
      'reportingFrequency',
      'returnVersionId',
      'siteDescription',
      'summer',
      'twoPartTariff',
      'upload'
    ])
    .whereNotIn('returnRequirements.externalId', externalIds)
    .whereExists(_whereExistsClause(returnCycle))
    .where('returnRequirements.summer', returnCycle.summer)
    .withGraphFetched('returnVersion')
    .modifyGraph('returnVersion', (returnVersionBuilder) => {
      returnVersionBuilder
        .select(['endDate', 'id', 'reason', 'startDate'])
        .withGraphFetched('licence')
        .modifyGraph('licence', (licenceBuilder) => {
          licenceBuilder
            .select([
              'expiredDate',
              'id',
              'lapsedDate',
              'licenceRef',
              'revokedDate',
              db.raw("regions->>'historicalAreaCode' as areacode")
            ])
            .withGraphFetched('region')
            .modifyGraph('region', (regionBuilder) => {
              regionBuilder.select(['id', 'naldRegionId'])
            })
        })
    })
    .withGraphFetched('points')
    .modifyGraph('points', (pointsBuilder) => {
      pointsBuilder.select(['points.description', 'points.ngr1', 'points.ngr2', 'points.ngr3', 'points.ngr4'])
    })
    .withGraphFetched('returnRequirementPurposes')
    .modifyGraph('returnRequirementPurposes', (returnRequirementPurposesBuilder) => {
      returnRequirementPurposesBuilder
        .select(['id'])
        .withGraphFetched('primaryPurpose')
        .modifyGraph('primaryPurpose', (primaryPurposeBuilder) => {
          primaryPurposeBuilder.select(['description', 'id', 'legacyId'])
        })
        .withGraphFetched('purpose')
        .modifyGraph('purpose', (purposeBuilder) => {
          purposeBuilder.select(['description', 'id', 'legacyId'])
        })
        .withGraphFetched('secondaryPurpose')
        .modifyGraph('secondaryPurpose', (secondaryPurposeBuilder) => {
          secondaryPurposeBuilder.select(['description', 'id', 'legacyId'])
        })
    })
}

function _whereExistsClause(returnCycle) {
  const { endDate: cycleEndDate, startDate: cycleStartDate } = returnCycle
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

  return query
}

module.exports = {
  go
}
