'use strict'

/**
 * Handles voiding the return logs for a licence after a no returns required return version has been created
 * @module VoidNoReturnRequiredLicenceReturnLogsService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const ReturnLogModel = require('../../models/return-log.model.js')

/**
 * Handles voiding the return logs for a licence after a no returns required return version has been created
 *
 * @param {string} licenceRef - The licenceRef of the licence
 * @param {Date} startDate - The start date of no returns required return version
 * @param {Date} endDate - The optional end date of no returns required return version
 */
async function go(licenceRef, startDate, endDate) {
  const query = ReturnLogModel.query()
    .patch({ status: 'void', updatedAt: timestampForPostgres() })
    .where('licenceRef', licenceRef)
    .where('startDate', '>=', startDate)

  if (endDate) {
    query.where('endDate', '<=', endDate)
  }

  await query
}

module.exports = {
  go
}
