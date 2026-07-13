/**
 * Handles voiding the return logs for a licence after a no returns required return version has been created
 * @module VoidReturnLogsService
 */

import ReturnLogModel from '../../models/return-log.model.js'
import { timestampForPostgres } from '../../lib/general.lib.js'

/**
 * Handles voiding the return logs for a licence after a no returns required return version has been created
 *
 * @param {string} licenceRef - The licenceRef of the licence
 * @param {Date} startDate - The start date of no returns required return version
 * @param {Date} endDate - The end date of no returns required return version
 * @param {object} trx - Transaction object
 */
export default async function voidReturnLogsService(licenceRef, startDate, endDate, trx) {
  const query = ReturnLogModel.query(trx)
    .patch({ status: 'void', updatedAt: timestampForPostgres() })
    .where('licenceRef', licenceRef)
    .where('startDate', '>=', startDate)

  if (endDate) {
    query.where('endDate', '<=', endDate)
  }

  await query
}
