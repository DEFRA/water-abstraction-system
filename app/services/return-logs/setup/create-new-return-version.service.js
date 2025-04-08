'use strict'

/**
 * Creates a new return version and supersedes the previous one for a given licence id, duplicating all details from the
 * current return version
 * @module CreateNewReturnVersion
 */

const ReturnVersionModel = require('../../../models/return-version.model.js')

/**
 * TODO: Document
 * TODO: Confirm if we need to set `externalId` now or if this is set later
 * @param licenceId
 */
async function go(licenceId) {
  const newReturnVersionStartDate = new Date()

  const currentReturnVersion = await _fetchCurrentReturnVersion(licenceId)
  const newReturnVersion = await _duplicateReturnVersion(licenceId, currentReturnVersion, newReturnVersionStartDate)

  await _markPreviousVersionAsSuperseded(currentReturnVersion, newReturnVersionStartDate)

  return { currentReturnVersionId: currentReturnVersion.id, newReturnVersionId: newReturnVersion.id }
}

async function _fetchCurrentReturnVersion(licenceId) {
  return await ReturnVersionModel.query()
    .where('licenceId', licenceId)
    .where('status', 'current')
    .orderBy('startDate', 'desc')
    .first()
}

async function _duplicateReturnVersion(licenceId, currentReturnVersion, startDate) {
  const nextVersionNumber = await _nextVersionNumber(licenceId)

  // TODO: Confirm what needs doing with externalId. We can see it's in the form `naldRegion:SOME_NUMBER:version`; we may
  // just be able to split by : and replace the version with the new one, then re-join with :
  return ReturnVersionModel.query().insert({
    ...currentReturnVersion,
    startDate,
    version: nextVersionNumber,
    externalId: null,
    id: undefined
  })
}

async function _markPreviousVersionAsSuperseded(returnVersion, endDate) {
  await returnVersion.$query().patch({ status: 'superseded', endDate })
}

async function _nextVersionNumber(licenceId) {
  const { lastVersionNumber } = await ReturnVersionModel.query()
    .max('version as lastVersionNumber')
    .where({ licenceId })
    .first()

  if (lastVersionNumber) {
    return lastVersionNumber + 1
  }

  return 1
}

module.exports = {
  go
}
