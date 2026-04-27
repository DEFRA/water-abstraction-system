'use strict'

/**
 * Create a new return version
 * @module CreateReturnVersionService
 */

const ReturnRequirementModel = require('../../../../models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../../../models/return-requirement-point.model.js')
const ReturnRequirementPurposeModel = require('../../../../models/return-requirement-purpose.model.js')
const ReturnVersionModel = require('../../../../models/return-version.model.js')

/**
 * Create a new return version
 *
 * Using the return version data that has been generated. This service populates the `return_versions`,
 * `return_requirements`, `return_requirement_points` and `return_requirement_purposes` tables which are required to
 * create a new return version for a licence.
 *
 * @param {object} returnVersionData - The return version data required to persist a new return version for a licence
 * @param {object} trx - Transaction object
 * @returns {Promise<module:ReturnVersionModel>} The instance of the created return version
 */
async function go(returnVersionData, trx) {
  const { returnRequirements, returnVersion } = returnVersionData

  const persistedReturnVersion = await ReturnVersionModel.query(trx).insert(returnVersion)

  await _persistReturnRequirements(returnRequirements, persistedReturnVersion.id, trx)

  return persistedReturnVersion
}

async function _persistReturnRequirements(returnRequirements, returnVersionId, trx) {
  for (const returnRequirement of returnRequirements) {
    const { id: returnRequirementId } = await ReturnRequirementModel.query(trx).insert({
      abstractionPeriodStartDay: returnRequirement.abstractionPeriodStartDay,
      abstractionPeriodStartMonth: returnRequirement.abstractionPeriodStartMonth,
      abstractionPeriodEndDay: returnRequirement.abstractionPeriodEndDay,
      abstractionPeriodEndMonth: returnRequirement.abstractionPeriodEndMonth,
      collectionFrequency: returnRequirement.collectionFrequency,
      fiftySixException: returnRequirement.fiftySixException,
      gravityFill: returnRequirement.gravityFill,
      reabstraction: returnRequirement.reabstraction,
      reportingFrequency: returnRequirement.reportingFrequency,
      returnsFrequency: returnRequirement.returnsFrequency,
      returnVersionId,
      siteDescription: returnRequirement.siteDescription,
      summer: returnRequirement.summer,
      twoPartTariff: returnRequirement.twoPartTariff
    })

    await _persistReturnRequirementsPoints(returnRequirement.points, returnRequirementId, trx)
    await _persistReturnRequirementsPurposes(returnRequirement.returnRequirementPurposes, returnRequirementId, trx)
  }
}

async function _persistReturnRequirementsPoints(points, returnRequirementId, trx) {
  for (const point of points) {
    await ReturnRequirementPointModel.query(trx).insert({ pointId: point, returnRequirementId })
  }
}

async function _persistReturnRequirementsPurposes(returnRequirementPurposes, returnRequirementId, trx) {
  for (const returnRequirementPurpose of returnRequirementPurposes) {
    await ReturnRequirementPurposeModel.query(trx).insert({
      alias: returnRequirementPurpose.alias,
      primaryPurposeId: returnRequirementPurpose.primaryPurposeId,
      purposeId: returnRequirementPurpose.purposeId,
      returnRequirementId,
      secondaryPurposeId: returnRequirementPurpose.secondaryPurposeId
    })
  }
}

module.exports = {
  go
}
