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
 * @param trx
 *
 * @returns
 */
async function go(licenceId, currentReturnVersionId, newReturnVersionId, trx = null) {
  const currentReturnRequirements = await _fetchReturnRequirements(currentReturnVersionId, trx)
  const newReturnRequirements = await _duplicateReturnRequirements(
    currentReturnRequirements,
    licenceId,
    newReturnVersionId,
    trx
  )

  return { currentReturnRequirements, newReturnRequirements }
}

async function _duplicateReturnRequirements(currentReturnRequirements, licenceId, newReturnVersionId, trx) {
  const naldRegionId = await _fetchNaldRegionId(licenceId, trx)
  const legacyId = await _nextLegacyId(naldRegionId, trx)

  const duplicateReturnRequirementsData = currentReturnRequirements.map((returnRequirement) => ({
    ...returnRequirement,
    legacyId,
    externalId: `${naldRegionId}:${legacyId}`,
    returnVersionId: newReturnVersionId,
    id: undefined
  }))

  return ReturnRequirementModel.query(trx).insert(duplicateReturnRequirementsData)
}

async function _fetchReturnRequirements(returnVersionId, trx) {
  return ReturnRequirementModel.query(trx).where({ returnVersionId })
}

async function _fetchNaldRegionId(licenceId, trx) {
  const { naldRegionId } = await LicenceModel.query(trx)
    .findById(licenceId)
    .select('region.naldRegionId')
    .innerJoinRelated('region')

  return naldRegionId
}

async function _nextLegacyId(naldRegionId, trx) {
  const { lastLegacyId } = await ReturnRequirementModel.query(trx)
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
