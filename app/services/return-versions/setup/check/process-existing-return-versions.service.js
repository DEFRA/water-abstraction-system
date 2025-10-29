'use strict'

/**
 * Processes existing return versions to update the their `status` and `endDate` when a new return version is created
 * @module ProcessExistingReturnVersionsService
 */

const ReturnVersionModel = require('../../../../models/return-version.model.js')
const { sameDate } = require('../../../../lib/dates.lib.js')

/**
 * Processes existing return versions to update the their `status` and `endDate` when a new return version is created
 *
 * Depending on the `startDate` of the new return version that is to be inserted. An existing return version may need
 * its `status` or `endDate` to be updated. An `endDate` may also need to be calculated for the new return version if
 * it is to be inserted between existing return versions, or is superseding an existing one that has an `endDate`.
 *
 * @param {string} licenceId - The UUID of the licence the requirements are for
 * @param {Date} newVersionStartDate - The date that the new return version starts
 *
 * @returns {Promise<Date>} The calculated `endDate` for the new return version if there is one. Null will be returned
 * if there is no `endDate`
 */
async function go(licenceId, newVersionStartDate) {
  const previousVersions = await _previousVersions(licenceId)
  const previousVersionEndDate = _calculateEndDate(newVersionStartDate)

  let result

  result = await _replacePreviousVersion(previousVersions, newVersionStartDate)
  if (result) {
    return result
  }

  result = await _endLatestVersion(previousVersions, newVersionStartDate, previousVersionEndDate)
  if (result) {
    return null
  }

  result = await _insertBetweenVersions(previousVersions, newVersionStartDate, previousVersionEndDate)
  if (result) {
    return result
  }

  result = await _insertBeforeVersions(previousVersions, newVersionStartDate)
  if (result) {
    return result
  }

  result = await _replaceLatestVersion(previousVersions, newVersionStartDate)
  if (result) {
    return null
  }

  return null
}

/**
 * Update the end date of the latest return version whose start data is less than the new one and whose end date is null
 *
 * For example, imagine these are the existing return versions
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2022-03-31 | current |
 * | 3  | 2022-04-01 |            | current |
 *
 * The user adds a new return version starting 2024-08-01. The end result would be
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2022-03-31 | current |
 * | 3  | 2022-04-01 | 2024-07-31 | current |
 * | 4  | 2022-08-01 |            | current |
 *
 * This function finds return version **3** and updates its end date to the start date of the new return version minus
 * 1 day. We don't care about the end date because the new return version doesn't need one.
 *
 * @private
 */
async function _endLatestVersion(previousVersions, newVersionStartDate, endDate) {
  const matchedReturnVersion = previousVersions.find((previousVersion) => {
    return previousVersion.startDate < newVersionStartDate && previousVersion.endDate === null
  })

  if (!matchedReturnVersion) {
    return null
  }

  return matchedReturnVersion.$query().patch({ endDate })
}

/**
 * Update the end date of a return version whose start date is less than the earliest existing one
 *
 * For example, imagine these are the existing return versions
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2024-04-21 |            | current |
 *
 * The user adds a new return version starting 2024-04-01. The end result would be
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2024-04-01 | 2024-04-20 | current |
 * | 2  | 2022-04-21 |            | current |
 *
 * This function generates the end date of the return version being the day before the start date of the existing one.
 *
 * @private
 */
async function _insertBeforeVersions(previousVersions, newVersionStartDate) {
  const matchedReturnVersion = previousVersions.findLast((previousVersion) => {
    return previousVersion.startDate > newVersionStartDate
  })

  if (!matchedReturnVersion) {
    return null
  }

  const newVersionEndDate = _calculateEndDate(matchedReturnVersion.startDate)

  return newVersionEndDate
}

/**
 * Update the end date of a previous version whose start date is less than the new one and whose end date is greater
 *
 * For example, imagine these are the existing return versions
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2022-03-31 | current |
 * | 3  | 2022-04-01 |            | current |
 *
 * The user adds a new return version starting 2021-07-01. The end result would be
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2021-06-30 | current |
 * | 4  | 2021-07-01 | 2022-03-31 | current |
 * | 3  | 2022-04-01 |            | current |
 *
 * This function finds return version **2** and updates its end date to the start date of the new return version minus
 * 1 day. We also return the end date from version **2** as this needs to be applied to the new return version. Hence,
 * we are _inserting between versions_.
 *
 * @private
 */
async function _insertBetweenVersions(previousVersions, newVersionStartDate, endDate) {
  const matchedReturnVersion = previousVersions.find((previousVersion) => {
    return previousVersion.startDate < newVersionStartDate && previousVersion.endDate > newVersionStartDate
  })

  if (!matchedReturnVersion) {
    return null
  }

  const newVersionEndDate = matchedReturnVersion.endDate

  await matchedReturnVersion.$query().patch({ endDate })

  return newVersionEndDate
}

function _calculateEndDate(changeDate) {
  // NOTE: You have to create a new date from changeDate else when we call setDate we change the original date object.
  const newEndDate = new Date(changeDate)

  newEndDate.setDate(newEndDate.getDate() - 1)

  return newEndDate
}

function _previousVersions(licenceId) {
  return ReturnVersionModel.query()
    .select(['endDate', 'id', 'startDate'])
    .where('licenceId', licenceId)
    .where('status', 'current')
    .orderBy('startDate', 'desc')
}

/**
 * Update the status of a previous version whose start date is equal to the new one and whose end date is null
 *
 * For example, imagine these are the existing return versions
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2022-03-31 | current |
 * | 3  | 2022-04-01 |            | current |
 *
 * The user adds a new return version starting 2022-04-01. The end result would be
 *
 * | Id | Start date | End date   | Status     |
 * |----|------------|------------|------------|
 * | 1  | 2008-04-01 | 2019-05-12 | current    |
 * | 2  | 2019-05-13 | 2022-03-31 | current    |
 * | 3  | 2022-04-01 |            | superseded |
 * | 4  | 2022-04-01 |            | current    |
 *
 * This function finds return version **3** and updates its status to `superseded`. We don't care about the end date
 * because the new return version doesn't need one.
 *
 * @private
 */
async function _replaceLatestVersion(previousVersions, newVersionStartDate) {
  const matchedReturnVersion = previousVersions.find((previousVersion) => {
    return sameDate(previousVersion.startDate, newVersionStartDate) && previousVersion.endDate === null
  })

  if (!matchedReturnVersion) {
    return null
  }

  return matchedReturnVersion.$query().patch({ status: 'superseded' })
}

/**
 * Update the status of a previous version whose start date is equal to the new one and whose end date is not null
 *
 * For example, imagine these are the existing return versions
 *
 * | Id | Start date | End date   | Status  |
 * |----|------------|------------|---------|
 * | 1  | 2008-04-01 | 2019-05-12 | current |
 * | 2  | 2019-05-13 | 2022-03-31 | current |
 * | 3  | 2022-04-01 |            | current |
 *
 * The user adds a new return version starting 2019-05-13. The end result would be
 *
 * | Id | Start date | End date   | Status     |
 * |----|------------|------------|------------|
 * | 1  | 2008-04-01 | 2019-05-12 | current    |
 * | 2  | 2019-05-13 | 2022-03-31 | superseded |
 * | 4  | 2019-05-13 | 2022-03-31 | current    |
 * | 3  | 2022-04-01 |            | current    |
 *
 * This function finds return version **2** and updates its status to `superseded`. We also return the end date from
 * version **2** as this needs to be applied to the new return version as its end date. Hence, we are _replacing a
 * previous version_.
 *
 * @private
 */
async function _replacePreviousVersion(previousVersions, newVersionStartDate) {
  const matchedReturnVersion = previousVersions.find((previousVersion) => {
    return sameDate(previousVersion.startDate, newVersionStartDate) && previousVersion.endDate >= newVersionStartDate
  })

  if (!matchedReturnVersion) {
    return null
  }

  const newVersionEndDate = matchedReturnVersion.endDate

  await matchedReturnVersion.$query().patch({ status: 'superseded' })

  return newVersionEndDate
}

module.exports = {
  go
}
