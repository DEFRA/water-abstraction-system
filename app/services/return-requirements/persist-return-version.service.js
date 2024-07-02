'use strict'

/**
 * Persists the data required to create a new return version
 * @module PersistReturnVersionService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')
const ReturnRequirementModel = require('../../models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../models/return-requirement-point.model.js')
const ReturnRequirementPurposeModel = require('../../models/return-requirement-purpose.model.js')

/**
 * Persists the data required to create a new return version
 *
 * Using the return version data that has been generated. This service populates the `return_versions`,
 * `return_requirements`, `return_requirement_points` and `return_requirement_purposes` tables which are required to
 * create a new return version for a licence.
 *
 * @param {Object} returnVersionData - The return version data required to persist a new return version for a licence
 */
async function go (returnVersionData) {
  const { returnRequirements, returnVersion } = returnVersionData

  const { id: returnVersionId } = await ReturnVersionModel.query().insert(returnVersion).returning('id')

  await _persistReturnRequirements(returnRequirements, returnVersionId)
}

async function _persistReturnRequirements (returnRequirements, returnVersionId) {
  for (const returnRequirement of returnRequirements) {
    const { id: returnRequirementId } = await ReturnRequirementModel.query()
      .insert({
        returnVersionId,
        returnsFrequency: returnRequirement.returnsFrequency,
        summer: returnRequirement.summer,
        abstractionPeriodStartDay: returnRequirement.abstractionPeriodStartDay,
        abstractionPeriodStartMonth: returnRequirement.abstractionPeriodStartMonth,
        abstractionPeriodEndDay: returnRequirement.abstractionPeriodEndDay,
        abstractionPeriodEndMonth: returnRequirement.abstractionPeriodEndMonth,
        siteDescription: returnRequirement.siteDescription,
        legacyId: returnRequirement.legacyId,
        externalId: returnRequirement.externalId,
        reportingFrequency: returnRequirement.reportingFrequency,
        collectionFrequency: returnRequirement.collectionFrequency,
        gravityFill: returnRequirement.gravityFill,
        reabstraction: returnRequirement.reabstraction,
        twoPartTariff: returnRequirement.twoPartTariff,
        fiftySixException: returnRequirement.fiftySixException
      })
      .returning('id')
  }
}

module.exports = {
  go
}
