'use strict'

/**
 * Service to handle the submission of the check page in the return logs setup flow
 * @module SubmitCheckService
 */

const CreateNewReturnVersionService = require('./create-new-return-version.service.js')
const LicenceModel = require('../../../models/licence.model.js')
const ReturnLogModel = require('../../../models/return-log.model.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')
const ReturnRequirementPointModel = require('../../../models/return-requirement-point.model.js')
const ReturnRequirementPurposeModel = require('../../../models/return-requirement-purpose.model.js')
const ReturnSubmissionLineModel = require('../../../models/return-submission-line.model.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')
const SessionModel = require('../../../models/session.model.js')

const { generateUUID } = require('../../../lib/general.lib.js')

/**
 * TODO: Document
 *
 * @param {string} sessionId - The ID of the session containing the return data
 * @returns {Promise<object>} - The result of the submission process
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  // TODO: Consider error handling

  const existingRequirements = await _fetchExistingReturnRequirements(session.data.licenceId)
  const returnVersion = await CreateNewReturnVersionService.go(session)
  await _createReturnRequirements(existingRequirements, returnVersion.id, session.data.licenceId)
  await _createReturnLines(session, returnVersion.id)
  await _markReturnLogAsSubmitted(session.data.returnLogId)
  await _cleanupSession(sessionId)

  // TODO: Confirm this is how we want to exit the service

  return {
    returnLogId: session.data.returnLogId,
    returnVersionId: returnVersion.id
  }
}

/**
 * Creates return lines from the session data
 *
 * @param {object} session - The session data containing line information
 * @param {string} returnVersionId - The ID of the return version
 * @returns {Promise<void>}
 */
async function _createReturnLines(session, returnVersionId) {
  const { lines } = session.data

  if (!lines || !lines.length) {
    return
  }

  const returnLines = lines.map((line) => ({
    ...line,
    id: generateUUID(),
    returnSubmissionId: returnVersionId
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

/**
 * Fetches existing return requirements for the current return version
 *
 * @param {string} licenceId - The ID of the licence
 * @returns {Promise<Array>} - The existing return requirements
 */
async function _fetchExistingReturnRequirements(licenceId) {
  const currentReturnVersion = await ReturnVersionModel.query().where({ licenceId, status: 'current' }).first()

  if (!currentReturnVersion) {
    return []
  }

  return ReturnRequirementModel.query()
    .where({ returnVersionId: currentReturnVersion.id })
    .withGraphFetched('points')
    .withGraphFetched('returnRequirementPurposes')
}

/**
 * Creates new return requirements for the new return version based on existing requirements
 *
 * @param {Array} existingRequirements - The existing return requirements
 * @param {string} returnVersionId - The ID of the new return version
 * @param licenceId
 * @returns {Promise<void>}
 */
async function _createReturnRequirements(existingRequirements, returnVersionId, licenceId) {
  if (!existingRequirements || !existingRequirements.length) {
    return
  }

  const naldRegionId = await _fetchNaldRegionId(licenceId)
  let legacyId = await _nextLegacyId(naldRegionId)

  for (const requirement of existingRequirements) {
    const newRequirement = await ReturnRequirementModel.query().insert({
      abstractionPeriodStartDay: requirement.abstractionPeriodStartDay,
      abstractionPeriodStartMonth: requirement.abstractionPeriodStartMonth,
      abstractionPeriodEndDay: requirement.abstractionPeriodEndDay,
      abstractionPeriodEndMonth: requirement.abstractionPeriodEndMonth,
      collectionFrequency: requirement.collectionFrequency,
      externalId: `${naldRegionId}:${legacyId}`,
      fiftySixException: requirement.fiftySixException,
      gravityFill: requirement.gravityFill,
      legacyId,
      reabstraction: requirement.reabstraction,
      reportingFrequency: requirement.reportingFrequency,
      returnsFrequency: requirement.returnsFrequency,
      returnVersionId,
      siteDescription: requirement.siteDescription,
      summer: requirement.summer,
      twoPartTariff: requirement.twoPartTariff
    })

    if (requirement.points && requirement.points.length) {
      for (const point of requirement.points) {
        await ReturnRequirementPointModel.query().insert({
          pointId: point.id,
          returnRequirementId: newRequirement.id
        })
      }
    }

    if (requirement.returnRequirementPurposes && requirement.returnRequirementPurposes.length) {
      for (const purpose of requirement.returnRequirementPurposes) {
        await ReturnRequirementPurposeModel.query().insert({
          alias: purpose.alias,
          primaryPurposeId: purpose.primaryPurposeId,
          purposeId: purpose.purposeId,
          returnRequirementId: newRequirement.id,
          secondaryPurposeId: purpose.secondaryPurposeId
        })
      }
    }

    legacyId++
  }
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
