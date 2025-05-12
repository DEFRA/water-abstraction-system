'use strict'

/**
 * Generate return requirement records for new quarterly return version from the existing one
 * @module GenerateReturnRequirementsData
 */

const { generateUUID } = require('../../../lib/general.lib.js')
const ReturnRequirementModel = require('../../../models/return-requirement.model.js')

/**
 * Generate return requirement records for new quarterly return version from the existing one
 *
 * Takes an array of existing return requirements and a new quarterly return version, and returns 3 arrays of objects:
 *
 * - returnRequirements: the new return requirements with ids and timestamps set
 * - returnRequirementPoints: the new return requirement points with ids and timestamps set
 * - returnRequirementPurposes: the new return requirement purposes with ids and timestamps set
 *
 * @param {object[]} existingReturnRequirements - the existing return requirements to copy
 * @param {object} quarterlyReturnVersion - the new quarterly return version to link them to
 * @param {number} naldRegionId - Used when generating the 'reference' for the new return requirements
 *
 * @returns {object} return requirement records ready for persisting
 */
async function go(existingReturnRequirements, quarterlyReturnVersion, naldRegionId) {
  const { id: quarterlyReturnVersionId, createdAt: timestamp } = quarterlyReturnVersion

  let legacyId = await _nextLegacyId(naldRegionId)

  const returnRequirements = []
  const returnRequirementPoints = []
  const returnRequirementPurposes = []

  for (const existingReturnRequirement of existingReturnRequirements) {
    const returnRequirement = _returnRequirement(
      existingReturnRequirement,
      quarterlyReturnVersionId,
      legacyId,
      timestamp
    )
    const points = _points(existingReturnRequirement, returnRequirement.id, timestamp)
    const purposes = _purposes(existingReturnRequirement, returnRequirement.id, timestamp)

    returnRequirements.push(returnRequirement)
    returnRequirementPoints.push(...points)
    returnRequirementPurposes.push(...purposes)

    legacyId++
  }

  return { returnRequirements, returnRequirementPoints, returnRequirementPurposes }
}

async function _nextLegacyId(naldRegionId) {
  const { lastLegacyId } = await ReturnRequirementModel.query()
    .max('legacyId as lastLegacyId')
    .whereLike('externalId', `${naldRegionId}%`)
    .limit(1)
    .first()

  return lastLegacyId + 1
}

function _points(existingReturnRequirement, returnRequirementId, timestamp) {
  const existingPoints = existingReturnRequirement.points

  return existingPoints.map((existingPoint) => {
    const { pointId } = existingPoint

    return {
      id: generateUUID(),
      pointId,
      returnRequirementId,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  })
}

function _purposes(existingReturnRequirement, returnRequirementId, timestamp) {
  const existingPurposes = existingReturnRequirement.returnRequirementPurposes

  return existingPurposes.map((existingPurpose) => {
    const { alias, primaryPurposeId, purposeId, secondaryPurposeId } = existingPurpose

    return {
      alias,
      id: generateUUID(),
      primaryPurposeId,
      purposeId,
      returnRequirementId,
      secondaryPurposeId,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  })
}

function _returnRequirement(existingReturnRequirement, quarterlyReturnVersionId, legacyId, timestamp) {
  const {
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    collectionFrequency,
    fiftySixException,
    gravityFill,
    reabstraction,
    reportingFrequency,
    returnsFrequency,
    siteDescription,
    summer,
    upload,
    twoPartTariff
  } = existingReturnRequirement

  return {
    abstractionPeriodEndDay,
    abstractionPeriodEndMonth,
    abstractionPeriodStartDay,
    abstractionPeriodStartMonth,
    collectionFrequency,
    fiftySixException,
    gravityFill,
    id: generateUUID(),
    legacyId,
    reabstraction,
    reportingFrequency,
    returnsFrequency,
    returnVersionId: quarterlyReturnVersionId,
    siteDescription,
    summer,
    upload,
    twoPartTariff,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

module.exports = {
  go
}
