'use strict'

/**
 * Service to handle the submission of the check page in the return logs setup flow
 * @module SubmitCheckService
 */

const { generateUUID } = require('../../../lib/general.lib.js')
const CreateNewReturnVersionService = require('./create-new-return-version.service.js')
const LicenceModel = require('../../../models/licence.model.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../../models/return-requirement-point.model.js')
const ReturnSubmissionLineModel = require('../../../models/return-submission-line.model.js')
const SessionModel = require('../../../models/session.model.js')

/**
 * TODO: Document
 *
 * @param {string} sessionId - The ID of the session containing the return data
 * @returns {Promise<object>} - The result of the submission process
 */
async function go(sessionId) {
  // TODO: Consider error handling
  const session = await SessionModel.query().findById(sessionId)

  const { licenceId, lines, returnSubmissionId, returnLogId } = session

  const { currentReturnVersionId, newReturnVersionId } = await CreateNewReturnVersionService.go(licenceId)

  const currentReturnRequirements = await ReturnRequirementModel.query().where({
    returnVersionId: currentReturnVersionId
  })
  const newReturnRequirements = await _cloneReturnRequirements(licenceId, currentReturnVersionId, newReturnVersionId)
  await _cloneReturnRequirementPoints(currentReturnRequirements, newReturnRequirements)

  await _createReturnLines(lines, returnSubmissionId)
  await _markReturnLogAsSubmitted(returnLogId)
  await _cleanupSession(sessionId)

  // TODO: Confirm how we want to exit the service
  return {
    returnLogId,
    returnSubmissionId,
    returnVersionId: newReturnVersionId
  }
}

async function _cloneReturnRequirements(licenceId, currentReturnVersionId, newReturnVersionId) {
  const currentReturnRequirements = await ReturnRequirementModel.query().where({
    returnVersionId: currentReturnVersionId
  })

  const naldRegionId = await _fetchNaldRegionId(licenceId)

  const legacyId = await _nextLegacyId(naldRegionId)

  const clonedReturnRequirementsData = currentReturnRequirements.map((returnRequirement) => ({
    ...returnRequirement,
    legacyId,
    externalId: `${naldRegionId}:${legacyId}`,
    returnVersionId: newReturnVersionId,
    id: undefined
  }))

  return ReturnRequirementModel.query().insert(clonedReturnRequirementsData)
}

async function _cloneReturnRequirementPoints(currentReturnRequirements, newReturnRequirements) {
  const currentReturnRequirementIds = currentReturnRequirements.map((returnRequirement) => returnRequirement.id)
  const currentReturnRequirementPoints = await ReturnRequirementPointModel.query().whereIn(
    'returnRequirementId',
    currentReturnRequirementIds
  )

  // When we clone the existing return requirement points, we need to do the following:
  // - Replace the existing return requirement id with the new one
  // - Generate a new external id by taking the existing one and replacing the legacy id in the middle of it with the
  //   new one
  // - Keep the existing point id
  //
  // To help us do this, we create a hash map of the existing return requirements (mapping id to the requirement) and
  // another mapping the existing return requiremend id to the new one
  const currentReturnRequirementsMap = new Map()
  const currentToNewReturnRequirementsMap = new Map()
  currentReturnRequirements.forEach((returnRequirement, index) => {
    currentReturnRequirementsMap.set(returnRequirement.id, returnRequirement)
    currentToNewReturnRequirementsMap.set(returnRequirement.id, newReturnRequirements[index])
  })

  const newPointsToInsert = currentReturnRequirementPoints.map((currentPoint) => {
    const currentReturnRequirement = currentReturnRequirementsMap.get(currentPoint.returnRequirementId)
    const newReturnRequirement = currentToNewReturnRequirementsMap.get(currentPoint.returnRequirementId)

    return {
      pointId: currentPoint.pointId,
      returnRequirementId: newReturnRequirement.id,
      externalId: currentPoint.externalId.replace(
        `:${currentReturnRequirement.legacyId}:`,
        `:${newReturnRequirement.legacyId}:`
      )
    }
  })

  return ReturnRequirementPointModel.query().insert(newPointsToInsert)
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

/**
 * Creates return lines from the session data
 *
 * @param {object[]} lines - The array of lines to create
 * @param {string} returnSubmissionId - The ID of the return submission
 * @returns {Promise<void>}
 */
async function _createReturnLines(lines, returnSubmissionId) {
  if (!lines || !lines.length) {
    return
  }

  const returnLines = lines.map((line) => ({
    ...line,
    id: generateUUID(),
    returnSubmissionId
  }))

  await ReturnSubmissionLineModel.query().insert(returnLines)
}

/**
 * Updates the return log status to reflect submission
 *
 * @param {string} returnLogId - The ID of the return log
 * @returns {Promise<void>}
 */
async function _markReturnLogAsSubmitted(returnLogId) {
  await ReturnLogModel.query().patch({ status: 'submitted' }).where({ id: returnLogId })
}

/**
 * Cleans up the session after submission
 *
 * @param {string} sessionId - The ID of the session to delete
 * @returns {Promise<void>}
 */
async function _cleanupSession(sessionId) {
  await SessionModel.query().deleteById(sessionId)
}

module.exports = {
  go
}
