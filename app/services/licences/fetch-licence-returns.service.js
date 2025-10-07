'use strict'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/returns` page
 * @module FetchLicenceReturnsService
 */

const ReturnLogModel = require('../../models/return-log.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/returns` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the data needed to populate the view licence page's returns tab
 */
async function go(licenceId, page) {
  const { results, total } = await _fetch(licenceId, page)

  return { returns: results, pagination: { total } }
}

async function _fetch(licenceId, page) {
  // NOTE: Because the return references are held in a varchar field, we have to convert them to an integer in our
  // order by for the results to be ordered as expected. Hence, we need to use orderByRaw()
  return ReturnLogModel.query()
    .select([
      'returnLogs.id',
      'returnLogs.dueDate',
      'returnLogs.endDate',
      'returnLogs.metadata',
      'returnLogs.returnReference',
      'returnLogs.startDate',
      'returnLogs.status'
    ])
    .innerJoinRelated('licence')
    .where('licence.id', licenceId)
    .orderByRaw('return_logs.start_date desc, return_logs.return_reference::integer desc')
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
