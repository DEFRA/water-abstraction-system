'use strict'

/**
 * Fetches a summary of each bill run for the selected page for /bill-runs
 * @module FetchBillRunsService
 */

const BillRunModel = require('../../models/bill-run.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches a summary of each bill run for the selected page for /bill-runs
 *
 * We use Objection.js {@link https://vincit.github.io/objection.js/recipes/paging.html#paging | paging functionality}
 * in conjunction with the
 * {@link https://design-system.service.gov.uk/components/pagination/ | GOV.UK pagination component} to support fetching
 * just the bill runs for the selected page.
 *
 * For example, if we have 100 bill runs and the default page size is 25, then we have 4 'pages' of results (100 / 4).
 * If the user selects page 3 then our service fetches bill runs 51 to 75. For this to work you _must_ use an order by
 * on the query (we use `createdAt DESC`).
 *
 * @param {number} page - the page number of bill runs to be viewed
 *
 * @returns {Promise<module:BillRunModel[]>} an array of bill runs that match the selected 'page in the data
 */
async function go(page = 1) {
  return _fetch(page)
}

async function _fetch(page) {
  return BillRunModel.query()
    .select([
      'billRuns.id',
      'billRuns.batchType',
      'billRuns.billRunNumber',
      'billRuns.createdAt',
      'billRuns.netTotal',
      'billRuns.scheme',
      'billRuns.status',
      'billRuns.summer',
      BillRunModel.raw('(invoice_count + credit_note_count) AS number_of_bills'),
      // NOTE: This is more accurate as it includes zero value bills but it is noticeably less performant
      // BillRunModel.relatedQuery('bills').count().as('numberOfBills'),
      'region.displayName AS region'
    ])
    .innerJoinRelated('region')
    .orderBy([{ column: 'createdAt', order: 'desc' }])
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
