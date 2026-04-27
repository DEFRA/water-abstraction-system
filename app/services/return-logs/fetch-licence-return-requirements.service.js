'use strict'

/**
 * Fetches return requirements for a given licence with an end date after the provided date
 * @module FetchLicenceReturnRequirementsService
 */

const LicenceModel = require('../../models/licence.model.js')
const ReturnRequirementModel = require('../../models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../models/return-requirement-point.model.js')
const ReturnRequirementPurposeModel = require('../../models/return-requirement-purpose.model.js')
const ReturnVersionModel = require('../../models/return-version.model.js')

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
  const returnVersions = await _returnVersions(licenceId, changeDate, trx)

  if (returnVersions.length === 0) {
    return []
  }

  const licence = await _licence(licenceId, trx)
  const returnRequirements = await _returnRequirements(returnVersions, trx)
  const returnRequirementPurposes = await _returnRequirementPurposes(returnRequirements, trx)
  const returnRequirementPoints = await _returnRequirementPoints(returnRequirements, trx)

  return _assemble(returnRequirements, returnVersions, licence, returnRequirementPurposes, returnRequirementPoints)
}

function _assemble(returnRequirements, returnVersions, licence, returnRequirementPurposes, returnRequirementPoints) {
  return returnRequirements.map((returnRequirement) => {
    return {
      abstractionPeriodEndDay: returnRequirement.abstractionPeriodEndDay,
      abstractionPeriodEndMonth: returnRequirement.abstractionPeriodEndMonth,
      abstractionPeriodStartDay: returnRequirement.abstractionPeriodStartDay,
      abstractionPeriodStartMonth: returnRequirement.abstractionPeriodStartMonth,
      externalId: returnRequirement.externalId,
      id: returnRequirement.id,
      reference: returnRequirement.reference,
      reportingFrequency: returnRequirement.reportingFrequency,
      returnVersionId: returnRequirement.returnVersionId,
      siteDescription: returnRequirement.siteDescription,
      summer: returnRequirement.summer,
      twoPartTariff: returnRequirement.twoPartTariff,
      returnVersion: _assembleReturnVersion(returnRequirement, returnVersions, licence),
      points: _assemblePoints(returnRequirement, returnRequirementPoints),
      returnRequirementPurposes: _assembleReturnRequirementPurposes(returnRequirement, returnRequirementPurposes)
    }
  })
}

function _assemblePoints(returnRequirement, returnRequirementPoints) {
  const matchingReturnRequirementPoints = returnRequirementPoints.filter((returnRequirementPoint) => {
    return returnRequirementPoint.returnRequirementId === returnRequirement.id
  })

  return matchingReturnRequirementPoints.map((matchingReturnRequirementPoint) => {
    return {
      description: matchingReturnRequirementPoint.description,
      ngr1: matchingReturnRequirementPoint.ngr1,
      ngr2: matchingReturnRequirementPoint.ngr2,
      ngr3: matchingReturnRequirementPoint.ngr3,
      ngr4: matchingReturnRequirementPoint.ngr4
    }
  })
}

function _assembleReturnRequirementPurposes(returnRequirement, returnRequirementPurposes) {
  const matchingReturnRequirementPurposes = returnRequirementPurposes.filter((returnRequirementPurpose) => {
    return returnRequirementPurpose.returnRequirementId === returnRequirement.id
  })

  return matchingReturnRequirementPurposes.map((matchingReturnRequirementPurpose) => {
    return {
      alias: matchingReturnRequirementPurpose.alias,
      id: matchingReturnRequirementPurpose.id,
      primaryPurpose: {
        description: matchingReturnRequirementPurpose.primaryPurposeDescription,
        id: matchingReturnRequirementPurpose.primaryPurposeId,
        legacyId: matchingReturnRequirementPurpose.primaryPurposeLegacyId
      },
      purpose: {
        description: matchingReturnRequirementPurpose.purposeDescription,
        id: matchingReturnRequirementPurpose.purposeId,
        legacyId: matchingReturnRequirementPurpose.purposeLegacyId
      },
      secondaryPurpose: {
        description: matchingReturnRequirementPurpose.secondaryPurposeDescription,
        id: matchingReturnRequirementPurpose.secondaryPurposeId,
        legacyId: matchingReturnRequirementPurpose.secondaryPurposeLegacyId
      }
    }
  })
}

function _assembleReturnVersion(returnRequirement, returnVersions, licence) {
  const matchingReturnVersion = returnVersions.find((returnVersion) => {
    return returnVersion.id === returnRequirement.returnVersionId
  })

  return {
    endDate: matchingReturnVersion.endDate,
    id: matchingReturnVersion.id,
    reason: matchingReturnVersion.reason,
    startDate: matchingReturnVersion.startDate,
    quarterlyReturns: matchingReturnVersion.quarterlyReturns,
    multipleUpload: matchingReturnVersion.multipleUpload,
    licence: {
      expiredDate: licence.expiredDate,
      id: licence.id,
      lapsedDate: licence.lapsedDate,
      licenceRef: licence.licenceRef,
      revokedDate: licence.revokedDate,
      areacode: licence.areacode,
      region: {
        id: licence.regionId,
        naldRegionId: licence.naldRegionId
      }
    }
  }
}

async function _returnRequirementPoints(returnRequirements, trx) {
  const returnRequirementIds = returnRequirements.map((returnRequirement) => {
    return returnRequirement.id
  })

  return ReturnRequirementPointModel.query(trx)
    .select([
      'returnRequirementPoints.id',
      'returnRequirementPoints.returnRequirementId',
      'returnRequirementPoints.pointId',
      'point.description',
      'point.ngr1',
      'point.ngr2',
      'point.ngr3',
      'point.ngr4'
    ])
    .innerJoinRelated('point')
    .whereIn('returnRequirementPoints.returnRequirementId', returnRequirementIds)
}

async function _returnRequirementPurposes(returnRequirements, trx) {
  const returnRequirementIds = returnRequirements.map((returnRequirement) => {
    return returnRequirement.id
  })

  return ReturnRequirementPurposeModel.query(trx)
    .select([
      'returnRequirementPurposes.alias',
      'returnRequirementPurposes.returnRequirementId',
      'returnRequirementPurposes.id',
      'returnRequirementPurposes.primaryPurposeId',
      'returnRequirementPurposes.purposeId',
      'returnRequirementPurposes.secondaryPurposeId',
      ReturnRequirementPurposeModel.raw('purpose.description AS "purposeDescription"'),
      ReturnRequirementPurposeModel.raw('purpose.legacy_id AS "purposeLegacyId"'),
      ReturnRequirementPurposeModel.raw('primary_purpose.description AS "primaryPurposeDescription"'),
      ReturnRequirementPurposeModel.raw('primary_purpose.legacy_id AS "primaryPurposeLegacyId"'),
      ReturnRequirementPurposeModel.raw('secondary_purpose.description AS "secondaryPurposeDescription"'),
      ReturnRequirementPurposeModel.raw('secondary_purpose.legacy_id AS "secondaryPurposeLegacyId"')
    ])
    .innerJoinRelated('purpose')
    .innerJoinRelated('primaryPurpose')
    .innerJoinRelated('secondaryPurpose')
    .whereIn('returnRequirementPurposes.returnRequirementId', returnRequirementIds)
}

async function _returnRequirements(returnVersions, trx) {
  const returnVersionIds = returnVersions.map((returnVersion) => {
    return returnVersion.id
  })

  return ReturnRequirementModel.query(trx)
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
    .whereIn('returnVersionId', returnVersionIds)
}

async function _returnVersions(licenceId, changeDate, trx) {
  return ReturnVersionModel.query(trx)
    .select([
      'returnVersions.endDate',
      'returnVersions.id',
      'returnVersions.licenceId',
      'returnVersions.reason',
      'returnVersions.startDate',
      'returnVersions.quarterlyReturns',
      'returnVersions.multipleUpload'
    ])
    .innerJoinRelated('licence')
    .where('licenceId', licenceId)
    .where((builder) => {
      builder.whereNull('endDate').orWhere('endDate', '>=', changeDate)
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
    .orderBy('startDate', 'desc')
}

async function _licence(licenceId, trx) {
  return LicenceModel.query(trx)
    .select([
      'licences.expiredDate',
      'licences.id',
      'licences.lapsedDate',
      'licences.licenceRef',
      'licences.regionId',
      'licences.revokedDate',
      LicenceModel.raw("regions->>'historicalAreaCode' as areacode"),
      LicenceModel.raw('region.nald_region_id AS "naldRegionId"')
    ])
    .innerJoinRelated('region')
    .findById(licenceId)
}

module.exports = {
  go
}
