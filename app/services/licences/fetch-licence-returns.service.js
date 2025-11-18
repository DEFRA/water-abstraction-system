'use strict'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/returns` page
 * @module FetchLicenceReturnsService
 */

const LicenceModel = require('../../models/licence.model.js')

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
  const { returnLogs, ...licence } = await _fetch(licenceId, page)

  return { returns: returnLogs, pagination: { total: returnLogs.total }, licence }
}

async function _fetch(licenceId, page) {
  return LicenceModel.query()
    .findById(licenceId)
    .select(['licenceRef'])
    .withGraphFetched('returnLogs')
    .modifyGraph('returnLogs', (builder) => {
      builder
        .select(['id', 'dueDate', 'endDate', 'metadata', 'returnId', 'returnReference', 'startDate', 'status'])
        // NOTE: Because the return references are held in a varchar field, we have to convert them to an integer in our
        // order by for the results to be ordered as expected. Hence, we need to use orderByRaw()
        .orderByRaw('return_logs.start_date desc, return_logs.return_reference::integer desc')
        .page(page - 1, DatabaseConfig.defaultPageSize)
    })
}

module.exports = {
  go
}
