'use strict'

/**
 * Persists the data required to create a new return version
 * @module PersistReturnVersionService
 */

const ReturnRequirementModel = require('../../../../models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../../../models/return-requirement-point.model.js')
const ReturnRequirementPurposeModel = require('../../../../models/return-requirement-purpose.model.js')
const ReturnVersionModel = require('../../../../models/return-version.model.js')

/**
 * Persists the data required to create a new return version
 *
 * Using the return version data that has been generated. This service populates the `return_versions`,
 * `return_requirements`, `return_requirement_points` and `return_requirement_purposes` tables which are required to
 * create a new return version for a licence.
 *
 * @param {object} returnVersionData - The return version data required to persist a new return version for a licence
 * @returns {Promise<module:ReturnVersionModel>} The instance of the persisted return version
 */
async function go(returnVersionData) {
  const { returnRequirements, returnVersion } = returnVersionData

  const persistedReturnVersion = await ReturnVersionModel.query().insert(returnVersion)

  await _persistReturnRequirements(returnRequirements, persistedReturnVersion.id)

  return persistedReturnVersion
}

async function _persistReturnRequirements(returnRequirements, returnVersionId) {
  for (const returnRequirement of returnRequirements) {
    const { id: returnRequirementId } = await ReturnRequirementModel.query().insert({
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

    await _persistReturnRequirementsPoints(returnRequirement.points, returnRequirementId)
    await _persistReturnRequirementsPurposes(returnRequirement.returnRequirementPurposes, returnRequirementId)
  }
}

async function _persistReturnRequirementsPoints(points, returnRequirementId) {
  for (const point of points) {
    await ReturnRequirementPointModel.query().insert({ pointId: point, returnRequirementId })
  }
}

async function _persistReturnRequirementsPurposes(returnRequirementPurposes, returnRequirementId) {
  for (const returnRequirementPurpose of returnRequirementPurposes) {
    await ReturnRequirementPurposeModel.query().insert({
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
