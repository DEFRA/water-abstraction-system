'use strict'

/**
 * Handles voiding the return logs for a licence after a no returns required return version has been created
 * @module VoidNoReturnRequiredLicenceReturnLogsService
 */

const ReturnLogModel = require('../../models/return-log.model.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')

/**
 * Handles voiding the return logs for a licence after a no returns required return version has been created
 *
 * @param {string} licenceRef - The licenceRef of the licence
 * @param {Date} startDate - The start date of no returns required return version
 * @param {Date} [endDate=null] - The optional end date of no returns required return version
 * @param {object} [trx=null] - Optional transaction object
 */
async function go(licenceRef, startDate, endDate = null, trx = null) {
  const query = (trx ? ReturnLogModel.query(trx) : ReturnLogModel.query())
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
