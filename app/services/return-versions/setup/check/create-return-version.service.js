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
 * @param {object} [trx=null] - Optional transaction object
 * @returns {Promise<module:ReturnVersionModel>} The instance of the created return version
 */
async function go(returnVersionData, trx = null) {
  const { returnRequirements, returnVersion } = returnVersionData

  const returnVersionQuery = trx ? ReturnVersionModel.query(trx) : ReturnVersionModel.query()
  const persistedReturnVersion = await returnVersionQuery.insert(returnVersion)

  await _persistReturnRequirements(returnRequirements, persistedReturnVersion.id, trx)

  return persistedReturnVersion
}

async function _persistReturnRequirements(returnRequirements, returnVersionId, trx) {
  for (const returnRequirement of returnRequirements) {
    const returnRequirementQuery = trx ? ReturnRequirementModel.query(trx) : ReturnRequirementModel.query()
    const { id: returnRequirementId } = await returnRequirementQuery.insert({
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
    const returnRequirementPointQuery = trx
      ? ReturnRequirementPointModel.query(trx)
      : ReturnRequirementPointModel.query()

    await returnRequirementPointQuery.insert({ pointId: point, returnRequirementId })
  }
}

async function _persistReturnRequirementsPurposes(returnRequirementPurposes, returnRequirementId, trx) {
  for (const returnRequirementPurpose of returnRequirementPurposes) {
    const returnRequirementPurposeQuery = trx
      ? ReturnRequirementPurposeModel.query(trx)
      : ReturnRequirementPurposeModel.query()

    await returnRequirementPurposeQuery.insert({
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
