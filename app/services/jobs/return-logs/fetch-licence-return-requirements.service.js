'use strict'

/**
 * Fetches data needed for generating return logs
 * @module FetchLicenceReturnRequirementsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')

const { db } = require('../../../../db/db.js')
const { cycleEndDateAsISO, cycleStartDateAsISO, cycleStartDate } = require('../../../lib/dates.lib.js')

/**
 * Given the licence reference this service returns the return requirements to be turned into return logs.
 *
 * @param {string} licenceReference - if provided only do the return log for that licence
 *
 * @returns {Promise<Array>} the array of return log payloads to be created in the database
 */
async function go (licenceReference) {
  return _fetchReturnRequirements(licenceReference)
}

async function _fetchExternalIds (licenceReference) {
  const externalIds = await ReturnLogModel.query()
    .select([db.raw("concat(metadata->'nald'->>'regionCode', ':', return_reference) as externalid")])
    .where('startDate', '>=', cycleStartDate(false))
    .whereNot('status', 'void')
    .where('licenceRef', licenceReference)

  const externalIdsArray = externalIds.map((item) => {
    return item.externalid
  })

  return externalIdsArray
}

async function _fetchReturnRequirements (licenceReference) {
  // pass in false to ge the all year start and end date to make sure we cover the entire year
  const _cycleEndDate = cycleEndDateAsISO(false)
  const _cycleStartDate = cycleStartDateAsISO(false)
  const externalIds = await _fetchExternalIds(licenceReference)

  return ReturnRequirementModel.query()
    .whereNotIn('returnRequirements.externalId', externalIds)
    .whereExists(_whereExistsClause(licenceReference, _cycleStartDate, _cycleEndDate))
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
        'startDate',
        db.raw('regions->>\'historicalAreaCode\' as areacode')])
    })
    .withGraphFetched('returnVersion.licence.region')
    .modifyGraph('returnVersion.licence.region', (builder) => {
      builder.select(['id', 'naldRegionId'])
    })
    .withGraphFetched('points')
    .modifyGraph('points', (builder) => {
      builder.select([
        'points.description',
        'points.ngr1',
        'points.ngr2',
        'points.ngr3',
        'points.ngr4'
      ])
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

function _whereExistsClause (licenceReference, cycleStartDate, cycleEndDate) {
  const query = ReturnVersionModel.query().select(1)

  query.select(1)
    .innerJoinRelated('licence')
    .where('licence.licenceRef', licenceReference)
    .where('returnVersions.startDate', '<=', cycleEndDate)
    .where('returnVersions.status', 'current')
    .where((builder) => {
      builder
        .whereNull('returnVersions.endDate')
        .orWhere('returnVersions.endDate', '>=', cycleStartDate)
    })
    // .where((builder) => {
    //   builder
    //     .whereNull('licence.expiredDate')
    //     .orWhere('licence.expiredDate', '>=', cycleStartDate)
    // })
    // .where((builder) => {
    //   builder
    //     .whereNull('licence.lapsedDate')
    //     .orWhere('licence.lapsedDate', '>=', cycleStartDate)
    // })
    // .where((builder) => {
    //   builder
    //     .whereNull('licence.revokedDate')
    //     .orWhere('licence.revokedDate', '>=', cycleStartDate)
    // })

  query.whereColumn('returnVersions.id', 'returnRequirements.returnVersionId')

  return query
}

module.exports = {
  go
}
