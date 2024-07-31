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
 * @param {Date} returnVersionStartDate - The date that the new return version starts
 *
 * @returns {Promise<Date>} The calculated `endDate` for the new return version if there is one. Null will be returned
 * if there is no `endDate`
 */
async function go (returnVersionStartDate) {
  // DO stuff to update existing return versions
}

module.exports = {
  go
}
