'use strict'

/**
 * Processes existing return versions to update the their `status` and `endDate` when a new return version is created
 * @module ProcessExistingReturnVersionsService
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Processes existing return versions to update the their `status` and `endDate` when a new return version is created
 *
 * Depending on the `startdate` of the new return version that is to be inserted. The existing return versions may need
 * their `status` and/or `endDate` to be updated. An `endDate` may also need to be calculated for the new return version
 * if it is to be inserted between existing ones.
 *
 * @param {String} licenceId - The UUID of the licence the requirements are for
 * @param {Date} returnVersionStartDate - The date that the new return version starts
 *
 * @returns {Promise<Date>} The calculated `endDate` for the new return version if there is one. Null will be returned
 * if there is no `endDate`
 */
async function go (licenceId, returnVersionStartDate) {
  // const endDate = await _processExistingReturnVersions(licenceId, returnVersionStartDate)

  // return endDate
}

function _addDaysToDate (date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

async function _processExistingReturnVersions (licenceId, returnVersionStartDate) {
  const currentReturnVersions = await ReturnVersionModel.query()
    .select('id', 'endDate')
    .where(licenceId)
    .andWhere('status', 'current')

  const checkOneResult = await _checkOne(licenceId, returnVersionStartDate)
  if (checkOneResult) {
    return null
  }

  const checkTwoResult = await _checkTwo(currentReturnVersions, licenceId, returnVersionStartDate)
  if (checkTwoResult) {
    return checkTwoResult
  }
}

/**
 * When a `current` return version exists with a start date less than the new one, and it has no end date. Then the end
 * date of the existing return version is set to the new version's start date minus 1 day, and no end date is applied to
 * the new return version
 */
async function _checkOne (licenceId, returnVersionStartDate) {
  const result = await ReturnVersionModel.query()
    .update({ endDate: _addDaysToDate(returnVersionStartDate, -1) })
    .where(licenceId)
    .andWhere('status', 'current')
    .andWhere('startDate', '<', returnVersionStartDate)
    .whereNull('endDate')

  if (result.length > 0) {
    return true
  }

  return false
}

/**
 * When a current return version exists with a start date less than the new one, and it has an end date which is greater
 * than the new one’s start date. Then the end date of the existing return version is updated to the new version’s start
 * date minus 1 day, and the end date of the new return version is set to the existing one's end date (prior to being updated)
 */
async function _checkTwo (currentReturnVersions, licenceId, returnVersionStartDate) {
  const result = await ReturnVersionModel.query()
    .returning('id')
    .update({ endDate: _addDaysToDate(returnVersionStartDate, -1) })
    .where(licenceId)
    .andWhere('status', 'current')
    .andWhere('startDate', '<', returnVersionStartDate)
    .andWhere('endDate', '>', returnVersionStartDate)

  if (result.length > 0) {
    // Find the updated return version's original end date so this can be used as the end date of the new return version
    const { endDate } = currentReturnVersions.find((currentReturnVersion) => {
      return currentReturnVersion.id === result[0].id
    })

    return endDate
  }

  return false
}

module.exports = {
  go
}
