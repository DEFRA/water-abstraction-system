'use strict'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/bills` page
 * @module FetchLicenceBillsService
 */

const BillModel = require('../../models/bill.model')

const DatabaseConfig = require('../../../config/database.config')

/**
 * Fetches all bills for a licence which is needed for the view '/licences/{id}/bills` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's bills tab
 */
async function go (licenceId, page) {
  const { results, total } = await _fetch(licenceId, page)

  return { bills: results, pagination: { total } }
}

async function _fetch (licenceId, page) {
  return BillModel.query()
    .select([
      'bills.id',
      'bills.invoiceNumber',
      'bills.accountNumber',
      'bills.financialYearEnding',
      'bills.netAmount',
      'bills.billingAccountId',
      'bills.createdAt'
    ])
    .innerJoinRelated('billLicences')
    .where('billLicences.licence_id', licenceId)
    .withGraphFetched('billRun')
    .modifyGraph('billRun', (builder) => {
      builder.select(['batchType'])
    })
    .orderBy([
      { column: 'createdAt', order: 'desc' }
    ])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
