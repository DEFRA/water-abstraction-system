'use strict'

/**
 * Fetches return requirements for a given licence with an end date after the provided date
 * @module FetchLicenceReturnRequirementsService
 */

const LicenceModel = require('../../models/licence.model.js')
const PointModel = require('../../models/point.model.js')
const PrimaryPurposeModel = require('../../models/primary-purpose.model.js')
const PurposeModel = require('../../models/purpose.model.js')
const RegionModel = require('../../models/region.model.js')
const ReturnRequirementModel = require('../../models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../models/return-requirement-point.model.js')
const ReturnRequirementPurposeModel = require('../../models/return-requirement-purpose.model.js')
const ReturnVersionModel = require('../../models/return-version.model.js')
const SecondaryPurposeModel = require('../../models/secondary-purpose.model.js')
const { db } = require('../../../db/db.js')

/**
 * Fetches return requirements for a given licence with an end date after the provided date
 *
 * ### Why individual sequential queries instead of withGraphFetched
 *
 * `withGraphFetched` uses `Promise.all()` internally to fire multiple sub-queries at the same time. Outside of a
 * transaction this is fine. But within a transaction all queries must go through the same single pg client connection.
 * Firing them concurrently causes the pg driver to emit a DeprecationWarning about calling `client.query()` when the
 * client is already executing a query (to be removed in pg@9).
 *
 * To avoid this, we break out each relation into its own sequential `await` query, batch by IDs where possible, then
 * manually assemble the result into the same shape that `withGraphFetched` would have produced.
 *
 * @param {string} licenceId - the UUID of the licence that the return requirements are linked to
 * @param {Date} changeDate - the date where the change occurs from and from which we need to reissue return logs from
 * @param {object} [trx=null] - Optional transaction object
 *
 * @returns {Promise<module:ReturnRequirementModel[]>} the matching return requirements for the licence and change date
 */
async function go(licenceId, changeDate, trx = null) {
  return _fetch(licenceId, changeDate, trx)
}

async function _fetch(licenceId, changeDate, trx) {
  const returnRequirements = await ReturnRequirementModel.query(trx)
    .select([
      'abstractionPeriodEndDay',
      'abstractionPeriodEndMonth',
      'abstractionPeriodStartDay',
      'abstractionPeriodStartMonth',
      'externalId',
      'id',
      'reference',
      'reportingFrequency',
      'returnVersionId',
      'siteDescription',
      'summer',
      'twoPartTariff'
    ])
    .whereExists(
      ReturnVersionModel.query()
        .innerJoinRelated('licence')
        .where('licence.id', licenceId)
        .where('returnVersions.status', 'current')
        .where((builder) => {
          builder.whereNull('returnVersions.endDate').orWhere('returnVersions.endDate', '>=', changeDate)
        })
        .where((builder) => {
          builder.whereNull('licence.expiredDate').orWhere('licence.expiredDate', '>=', changeDate)
        })
        .where((builder) => {
          builder.whereNull('licence.lapsedDate').orWhere('licence.lapsedDate', '>=', changeDate)
        })
        .where((builder) => {
          builder.whereNull('licence.revokedDate').orWhere('licence.revokedDate', '>=', changeDate)
        })
        .whereColumn('returnVersions.id', 'returnRequirements.returnVersionId')
    )

  if (returnRequirements.length === 0) {
    return returnRequirements
  }

  const returnRequirementIds = returnRequirements.map((rr) => rr.id)
  const returnVersionIds = [...new Set(returnRequirements.map((rr) => rr.returnVersionId))]

  // Fetch return versions
  const returnVersions = await ReturnVersionModel.query(trx)
    .select(['endDate', 'id', 'licenceId', 'reason', 'startDate', 'quarterlyReturns', 'multipleUpload'])
    .whereIn('id', returnVersionIds)

  // Fetch licences
  const licenceIds = [...new Set(returnVersions.map((rv) => rv.licenceId))]
  const licences = await LicenceModel.query(trx)
    .select([
      'expiredDate',
      'id',
      'lapsedDate',
      'licenceRef',
      'regionId',
      'revokedDate',
      db.raw("regions->>'historicalAreaCode' as areacode")
    ])
    .whereIn('id', licenceIds)

  // Fetch regions
  const regionIds = [...new Set(licences.filter((l) => l.regionId).map((l) => l.regionId))]
  const regions = await RegionModel.query(trx).select(['id', 'naldRegionId']).whereIn('id', regionIds)

  // Fetch points via the junction table (return_requirement_points joined to points)
  const pointRows = await ReturnRequirementPointModel.query(trx)
    .select([
      'returnRequirementPoints.returnRequirementId',
      'points.description',
      'points.ngr1',
      'points.ngr2',
      'points.ngr3',
      'points.ngr4'
    ])
    .innerJoin('points', 'points.id', 'returnRequirementPoints.pointId')
    .whereIn('returnRequirementPoints.returnRequirementId', returnRequirementIds)

  // Fetch return requirement purposes
  const returnRequirementPurposes = await ReturnRequirementPurposeModel.query(trx)
    .select(['alias', 'id', 'primaryPurposeId', 'purposeId', 'returnRequirementId', 'secondaryPurposeId'])
    .whereIn('returnRequirementId', returnRequirementIds)

  // Fetch purpose lookup tables (sequentially to avoid concurrent queries on the transaction connection)
  const primaryPurposeIds = [...new Set(returnRequirementPurposes.map((p) => p.primaryPurposeId))]
  const purposeIds = [...new Set(returnRequirementPurposes.map((p) => p.purposeId))]
  const secondaryPurposeIds = [...new Set(returnRequirementPurposes.map((p) => p.secondaryPurposeId))]

  const primaryPurposes = await PrimaryPurposeModel.query(trx)
    .select(['description', 'id', 'legacyId'])
    .whereIn('id', primaryPurposeIds)

  const purposes = await PurposeModel.query(trx).select(['description', 'id', 'legacyId']).whereIn('id', purposeIds)

  const secondaryPurposes = await SecondaryPurposeModel.query(trx)
    .select(['description', 'id', 'legacyId'])
    .whereIn('id', secondaryPurposeIds)

  // Build lookup maps for efficient assembly
  const regionMap = new Map(regions.map((r) => [r.id, r]))
  const licenceMap = new Map(licences.map((l) => [l.id, l]))
  const returnVersionMap = new Map(returnVersions.map((rv) => [rv.id, rv]))
  const primaryPurposeMap = new Map(primaryPurposes.map((p) => [p.id, p]))
  const purposeMap = new Map(purposes.map((p) => [p.id, p]))
  const secondaryPurposeMap = new Map(secondaryPurposes.map((p) => [p.id, p]))

  // Mutate LicenceModel instances in place: add region, strip regionId
  for (const licence of licences) {
    licence.region = regionMap.get(licence.regionId) ?? null
    delete licence.regionId
  }

  // Mutate ReturnVersionModel instances in place: add licence, strip licenceId
  for (const rv of returnVersions) {
    rv.licence = licenceMap.get(rv.licenceId) ?? null
    delete rv.licenceId
  }

  // Build points map: create PointModel instances (no id) from the joined rows
  const pointsByReqId = new Map()
  for (const row of pointRows) {
    const point = PointModel.fromJson({
      description: row.description,
      ngr1: row.ngr1,
      ngr2: row.ngr2,
      ngr3: row.ngr3,
      ngr4: row.ngr4
    })
    if (!pointsByReqId.has(row.returnRequirementId)) {
      pointsByReqId.set(row.returnRequirementId, [])
    }
    pointsByReqId.get(row.returnRequirementId).push(point)
  }

  // Mutate ReturnRequirementPurposeModel instances: add nested models, strip FK columns
  const purposesByReqId = new Map()
  for (const rrp of returnRequirementPurposes) {
    const reqId = rrp.returnRequirementId
    rrp.primaryPurpose = primaryPurposeMap.get(rrp.primaryPurposeId) ?? null
    rrp.purpose = purposeMap.get(rrp.purposeId) ?? null
    rrp.secondaryPurpose = secondaryPurposeMap.get(rrp.secondaryPurposeId) ?? null
    delete rrp.primaryPurposeId
    delete rrp.purposeId
    delete rrp.secondaryPurposeId
    delete rrp.returnRequirementId
    if (!purposesByReqId.has(reqId)) {
      purposesByReqId.set(reqId, [])
    }
    purposesByReqId.get(reqId).push(rrp)
  }

  // Assemble final result on the ReturnRequirementModel instances
  for (const returnRequirement of returnRequirements) {
    returnRequirement.returnVersion = returnVersionMap.get(returnRequirement.returnVersionId) ?? null
    returnRequirement.points = pointsByReqId.get(returnRequirement.id) ?? []
    returnRequirement.returnRequirementPurposes = purposesByReqId.get(returnRequirement.id) ?? []
  }

  return returnRequirements
}

module.exports = {
  go
}
