'use strict'

/**
 * Persists the data required to create a new return version
 * @module PersistReturnVersionService
 */

const ReturnRequirementModel = require('../../models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../models/return-requirement-point.model.js')
const ReturnRequirementPurposeModel = require('../../models/return-requirement-purpose.model.js')
const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Persists the data required to create a new return version
 *
 * Using the return version data that has been generated. This service populates the `return_versions`,
 * `return_requirements`, `return_requirement_points` and `return_requirement_purposes` tables which are required to
 * create a new return version for a licence.
 *
 * @param {object} returnVersionData - The return version data required to persist a new return version for a licence
 */
async function go (returnVersionData) {
  const { returnRequirements, returnVersion } = returnVersionData

  const { id: returnVersionId } = await ReturnVersionModel.query().insert(returnVersion)

  await _persistReturnRequirements(returnRequirements, returnVersionId)
}

async function _persistReturnRequirements (returnRequirements, returnVersionId) {
  for (const returnRequirement of returnRequirements) {
    const { id: returnRequirementId } = await ReturnRequirementModel.query()
      .insert({
        abstractionPeriodStartDay: returnRequirement.abstractionPeriodStartDay,
        abstractionPeriodStartMonth: returnRequirement.abstractionPeriodStartMonth,
        abstractionPeriodEndDay: returnRequirement.abstractionPeriodEndDay,
        abstractionPeriodEndMonth: returnRequirement.abstractionPeriodEndMonth,
        collectionFrequency: returnRequirement.collectionFrequency,
        externalId: returnRequirement.externalId,
        fiftySixException: returnRequirement.fiftySixException,
        gravityFill: returnRequirement.gravityFill,
        legacyId: returnRequirement.legacyId,
        reabstraction: returnRequirement.reabstraction,
        reportingFrequency: returnRequirement.reportingFrequency,
        returnsFrequency: returnRequirement.returnsFrequency,
        returnVersionId,
        siteDescription: returnRequirement.siteDescription,
        summer: returnRequirement.summer,
        twoPartTariff: returnRequirement.twoPartTariff
      })

    await _persistReturnRequirementsPoints(returnRequirement.returnRequirementPoints, returnRequirementId)
    await _persistReturnRequirementsPurposes(returnRequirement.returnRequirementPurposes, returnRequirementId)
  }
}

async function _persistReturnRequirementsPoints (returnRequirementPoints, returnRequirementId) {
  for (const returnRequirementPoint of returnRequirementPoints) {
    await ReturnRequirementPointModel.query().insert({
      description: returnRequirementPoint.description,
      externalId: returnRequirementPoint.externalId,
      naldPointId: returnRequirementPoint.naldPointId,
      ngr1: returnRequirementPoint.ngr1,
      ngr2: returnRequirementPoint.ngr2,
      ngr3: returnRequirementPoint.ngr3,
      ngr4: returnRequirementPoint.ngr4,
      returnRequirementId
    })
  }
}

async function _persistReturnRequirementsPurposes (returnRequirementPurposes, returnRequirementId) {
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
