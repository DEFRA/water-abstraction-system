'use strict'

/**
 * Fetches data needed for the generating return logs
 * @module FetchReturnRequirementsService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')

const { db } = require('../../../../db/db.js')
const { cycleEndDateAsISO, cycleStartDateAsISO } = require('../../../lib/dates.lib.js')

/**
 * Fetch all return requirements that need return logs created.
 *
 * @param {boolean} summer - are we running summer cycle or all year
 * @param {string} licenceReference - if provided only do the return log for that licence reference
 *
 * @returns {Promise<Array>} the list of return requirement ids
 */
async function go (summer, licenceReference) {
  return _fetchReturnRequirements(summer, licenceReference)
}

async function _fetchExternalIds (cycleStartDate) {
  const externalIds = await ReturnLogModel.query()
    .select(['licenceRef',
      db.raw("concat(metadata->'nald'->>'regionCode', ':', return_reference) as externalid")
    ])
    .where('startDate', '>=', cycleStartDate)

  const externalIdsArray = externalIds.map((item) => {
    return item.externalid
  })

  return externalIdsArray
}

async function _fetchReturnRequirements (summer, licenceReference) {
  const _cycleEndDate = cycleEndDateAsISO(summer)
  const _cycleStartDate = cycleStartDateAsISO(summer)
  const externalIds = await _fetchExternalIds(_cycleStartDate)

  return ReturnRequirementModel.query()
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
    .whereExists(_whereExistsClause(licenceReference, _cycleStartDate, _cycleEndDate))
    .where('returnRequirements.summer', summer)
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
