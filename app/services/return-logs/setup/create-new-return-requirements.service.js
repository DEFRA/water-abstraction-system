'use strict'

/**
 * Creates a new return version and supersedes the previous one for a given licence id, duplicating all details from the
 * current return version
 * @module CreateNewReturnRequirementsService
 */

const LicenceModel = require('../../../models/licence.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')

/**
 * TODO: Document
 *
 * @param licenceId
 * @param currentReturnVersionId
 * @param newReturnVersionId
 *
 * @returns
 */
async function go(licenceId, currentReturnVersionId, newReturnVersionId) {
  const currentReturnRequirements = await _fetchReturnRequirements(currentReturnVersionId)
  const newReturnRequirements = await _duplicateReturnRequirements(
    currentReturnRequirements,
    licenceId,
    newReturnVersionId
  )

  return { currentReturnRequirements, newReturnRequirements }
}

async function _duplicateReturnRequirements(currentReturnRequirements, licenceId, newReturnVersionId) {
  const naldRegionId = await _fetchNaldRegionId(licenceId)
  const legacyId = await _nextLegacyId(naldRegionId)

  const duplicateReturnRequirementsData = currentReturnRequirements.map((returnRequirement) => ({
    ...returnRequirement,
    legacyId,
    externalId: `${naldRegionId}:${legacyId}`,
    returnVersionId: newReturnVersionId,
    id: undefined
  }))

  return ReturnRequirementModel.query().insert(duplicateReturnRequirementsData)
}

async function _fetchReturnRequirements(returnVersionId) {
  return await ReturnRequirementModel.query().where({ returnVersionId })
}

async function _fetchNaldRegionId(licenceId) {
  const { naldRegionId } = await LicenceModel.query()
    .findById(licenceId)
    .select('region.naldRegionId')
    .innerJoinRelated('region')

  return naldRegionId
}

async function _nextLegacyId(naldRegionId) {
  const { lastLegacyId } = await ReturnRequirementModel.query()
    .max('legacyId as lastLegacyId')
    .whereLike('externalId', `${naldRegionId}%`)
    .first()

  if (lastLegacyId) {
    return lastLegacyId + 1
  }

  return 1
}

module.exports = {
  go
}
