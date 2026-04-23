'use strict'

/**
 * Updates the end date for a return version
 * @module UpdateReturnVersionEndDateDal
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Updates the end date for a return version
 *
 * @param {string} returnVersionId - The UUID of the return version to update
 * @param {Date} endDate - The new end date for the return version
 * @param {object} trx - Database transaction object to ensure all DB changes are applied, or none at all
 */
async function go(returnVersionId, endDate, trx) {
  await ReturnVersionModel.query(trx).findById(returnVersionId).patch({ endDate })
}

module.exports = {
  go
}
