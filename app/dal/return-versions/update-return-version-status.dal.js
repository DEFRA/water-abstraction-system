'use strict'

/**
 * Updates the status of a return version
 * @module UpdateReturnVersionStatusDal
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Updates the status of a return version
 *
 * @param {string} returnVersionId - The UUID of the return version to update
 * @param {string} status - The new status for the return version
 * @param {object} trx - Database transaction object to ensure all DB changes are applied, or none at all
 */
async function go(returnVersionId, status, trx) {
  await ReturnVersionModel.query(trx).findById(returnVersionId).patch({ status })
}

module.exports = {
  go
}
