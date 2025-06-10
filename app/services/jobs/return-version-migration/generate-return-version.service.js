'use strict'

/**
 * Generates a new quarterly return version for a licence with quarterly returns enabled
 * @module GenerateReturnVersionService
 */

const { generateUUID, timestampForPostgres } = require('../../../lib/general.lib.js')
const GenerateReturnRequirementsData = require('./generate-return-requirements-data.service.js')
const ReturnVersionModel = require('../../../models/return-version.model.js')

const CHANGE_NOTE = 'Changed due to water company licences moving to quarterly returns'

/**
 * Generates a new quarterly return version for a licence with quarterly returns enabled
 *
 * Takes an existing return version and a user as arguments, and generates a new return version for the same licence
 * with the same requirements, but with quarterly returns enabled and a new version number.
 *
 * @param {object} existingReturnVersion - The existing return version to create a quarterly version from
 * @param {object} user - The user to be assigned recorded as the 'created by'
 *
 * @returns The new quarterly return version, and its dependents (requirements, requirement points, and requirement
 * purposes)
 */
async function go(existingReturnVersion, user) {
  const nextVersionNumber = await _nextVersionNumber(existingReturnVersion.licenceId)

  const quarterlyReturnVersion = _quarterlyReturnVersion(existingReturnVersion, user, nextVersionNumber)
  const returnRequirementsData = await GenerateReturnRequirementsData.go(
    existingReturnVersion.returnRequirements,
    quarterlyReturnVersion
  )

  quarterlyReturnVersion.returnRequirements = returnRequirementsData.returnRequirements
  quarterlyReturnVersion.returnRequirementPoints = returnRequirementsData.returnRequirementPoints
  quarterlyReturnVersion.returnRequirementPurposes = returnRequirementsData.returnRequirementPurposes

  return quarterlyReturnVersion
}

async function _nextVersionNumber(licenceId) {
  const { lastVersionNumber } = await ReturnVersionModel.query()
    .max('version as lastVersionNumber')
    .where({ licenceId })
    .limit(1)
    .first()

  return lastVersionNumber + 1
}

function _note(existingReturnVersion) {
  const { notes } = existingReturnVersion

  if (!notes) {
    return CHANGE_NOTE
  }

  return `${notes}, ${CHANGE_NOTE}`
}

function _quarterlyReturnVersion(existingReturnVersion, user, nextVersionNumber) {
  const { licenceId, multipleUpload } = existingReturnVersion
  const timestamp = timestampForPostgres()

  return {
    id: generateUUID(),
    licenceId,
    multipleUpload,
    notes: _note(existingReturnVersion),
    reason: 'change-to-return-requirements',
    quarterlyReturns: true,
    startDate: new Date('2025-04-01'),
    status: 'current',
    version: nextVersionNumber,
    createdBy: user.id,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

module.exports = {
  go
}
