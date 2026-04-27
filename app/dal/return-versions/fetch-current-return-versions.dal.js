'use strict'

/**
 * Fetches the 'current' return versions for a licence
 * @module FetchCurrentReturnVersionsDal
 */

const ReturnVersionModel = require('../../models/return-version.model.js')

/**
 * Fetches the 'current' return versions for a licence
 *
 * @param {string} licenceId - The UUID of the licence to fetch return versions for
 * @param {object} trx - Database transaction object to ensure all DB changes are applied, or none at all
 *
 * @returns {Promise<module:ReturnVersionModel[]>} The 'current' return versions for the licence ordered by `startDate`
 * descending
 */
async function go(licenceId, trx) {
  return ReturnVersionModel.query(trx)
    .select(['endDate', 'id', 'startDate'])
    .where('licenceId', licenceId)
    .where('status', 'current')
    .orderBy('startDate', 'desc')
}

module.exports = {
  go
}
