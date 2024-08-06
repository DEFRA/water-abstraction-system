'use strict'

/**
 * Processes existing return versions to update the their `status` and `endDate` when a new return version is created
 * @module ProcessExistingReturnVersionsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Processes existing return versions to update the their `status` and `endDate` when a new return version is created
 *
 * Depending on the `startDate` of the new return version that is to be inserted. An existing return version may need
 * its `status` or `endDate` to be updated. An `endDate` may also need to be calculated for the new return version if
 * it is to be inserted between existing return versions, or is superseding an existing one that has an `endDate`.
 *
 * @param {String} licenceId - The UUID of the licence the requirements are for
 * @param {Date} returnVersionStartDate - The date that the new return version starts
 *
 * @returns {Promise<Date>} The calculated `endDate` for the new return version if there is one. Null will be returned
 * if there is no `endDate`
 */
async function go (licenceId, returnVersionStartDate) {
  const endDate = await _processExistingReturnVersions(licenceId, returnVersionStartDate)

  return endDate
}

function _addDaysToDate (date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

async function _processExistingReturnVersions (licenceId, returnVersionStartDate) {
  let newReturnVersionEndDate = null
  let matchedReturnVersion

  const currentReturnVersions = await ReturnVersionModel.query()
    .select('id', 'startDate', 'endDate')
    .where('licenceId', licenceId)
    .andWhere('status', 'current')

  // When a `current` return version exists with a start date less than the new one, and it has no end date. Then the
  // end date of the existing return version is set to the new version's start date minus 1 day, and no end date is
  // applied to the new return version
  matchedReturnVersion = currentReturnVersions.find((currentReturnVersion) => {
    return currentReturnVersion.startDate < returnVersionStartDate && currentReturnVersion.endDate === null
  })

  if (matchedReturnVersion) {
    await _updateExistingReturnVersion(matchedReturnVersion.id, { endDate: _addDaysToDate(returnVersionStartDate, -1) })

    return newReturnVersionEndDate
  }

  // When a `current` return version exists with a start date less than the new one, and it has an end date which is
  // greater than the new one’s start date. Then the end date of the existing return version is updated to the new
  // version’s start date minus 1 day, and the end date of the new return version is set to the existing one's end date
  // (prior to being updated)
  matchedReturnVersion = currentReturnVersions.find((currentReturnVersion) => {
    return currentReturnVersion.startDate < returnVersionStartDate &&
      currentReturnVersion.endDate > returnVersionStartDate
  })

  if (matchedReturnVersion) {
    newReturnVersionEndDate = matchedReturnVersion.endDate
    await _updateExistingReturnVersion(matchedReturnVersion.id, { endDate: _addDaysToDate(returnVersionStartDate, -1) })

    return newReturnVersionEndDate
  }

  // When a `current` return version exists with a start date matching the new one, and it has no end date. The status
  // of the existing return version is updated to `superseded` and no end date is applied to the new return version
  matchedReturnVersion = currentReturnVersions.find((currentReturnVersion) => {
    return currentReturnVersion.startDate.getTime() === returnVersionStartDate.getTime() &&
      currentReturnVersion.endDate === null
  })

  if (matchedReturnVersion) {
    await _updateExistingReturnVersion(matchedReturnVersion.id, { status: 'superseded' })

    return newReturnVersionEndDate
  }

  // When a `current` return version exists with a matching start date to the new one, and it has an end date. Then the
  // status of the existing return version is updated to `superseded` and the end date of the new return version is set
  // to the existing one’s end date
  matchedReturnVersion = currentReturnVersions.find((currentReturnVersion) => {
    return currentReturnVersion.startDate.getTime() === returnVersionStartDate.getTime() &&
      currentReturnVersion.endDate !== null
  })

  if (matchedReturnVersion) {
    newReturnVersionEndDate = matchedReturnVersion.endDate
    await _updateExistingReturnVersion(matchedReturnVersion.id, { status: 'superseded' })

    return newReturnVersionEndDate
  }

  return newReturnVersionEndDate
}

async function _updateExistingReturnVersion (id, updateData) {
  return ReturnVersionModel.query().patch(updateData).where({ id })
}

module.exports = {
  go
}
