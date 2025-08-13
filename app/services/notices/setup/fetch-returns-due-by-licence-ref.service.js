'use strict'

/**
 * Fetches the returns due for `/notices/setup/{sessionId}/return-forms` page
 * @module FetchReturnsDueByLicenceRefService
 */

const ReturnLogModel = require('../../../models/return-log.model.js')
const { db } = require('../../../../db/db.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Fetches the returns due for `/notices/setup/{sessionId}/return-forms` page
 *
 * @param {string} licenceRef - The licence reference to fetch 'due' return logs for
 *
 * @returns {Promise<module:ReturnLogModel[]>}
 */
async function go(licenceRef) {
  return _fetch(licenceRef)
}

async function _fetch(licenceRef) {
  return ReturnLogModel.query()
    .select([
      'dueDate',
      'endDate',
      'returnId',
      'returnReference',
      'returnsFrequency',
      'startDate',
      db.raw(`metadata->'purposes'->0->'tertiary'->>'description' as purpose`),
      db.raw(`metadata->'isTwoPartTariff' as two_part_tariff`),
      db.raw(`metadata->'description' as site_description`)
    ])
    .where('licenceRef', licenceRef)
    .where('endDate', '<=', timestampForPostgres())
    .where('status', 'due')
    .orderBy([
      { column: 'startDate', order: 'desc' },
      { column: 'returnReference', order: 'asc' }
    ])
}

module.exports = {
  go
}
