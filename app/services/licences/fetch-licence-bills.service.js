'use strict'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/bills` page
 * @module FetchLicenceBillsService
 */

const BillModel = require('../../models/bill.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches all bills for a licence which is needed for the view '/licences/{id}/bills` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} the data needed to populate the view licence page's bills tab
 */
async function go (licenceId, page) {
  const { results, total } = await _fetch(licenceId, page)

  return { bills: results, pagination: { total } }
}

async function _fetch (licenceId, page) {
  return BillModel.query()
    .select([
      'bills.accountNumber',
      'bills.billingAccountId',
      'bills.createdAt',
      'bills.credit',
      'bills.deminimis',
      'bills.financialYearEnding',
      'bills.id',
      'bills.invoiceNumber',
      'bills.legacyId',
      'bills.netAmount'
    ])
    .innerJoinRelated('billLicences')
    .innerJoin('billRuns', 'billRuns.id', 'bills.billRunId')
    .where('billLicences.licence_id', licenceId)
    .where('billRuns.status', 'sent')
    .withGraphFetched('billRun')
    .modifyGraph('billRun', (builder) => {
      builder.select([
        'id',
        'batchType',
        'scheme',
        'summer'
      ])
    })
    .orderBy([
      { column: 'createdAt', order: 'desc' }
    ])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
