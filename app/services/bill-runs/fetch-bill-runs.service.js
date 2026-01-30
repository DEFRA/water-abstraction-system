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
 * @param {object} filters - an object containing the different filters to apply to the query
 * @param {number} page - The current page for the pagination service
 *
 * @returns {Promise<module:BillRunModel[]>} an array of bill runs that match the selected 'page in the data
 */
async function go(filters, page) {
  const query = _fetchQuery()

  _applyFilters(query, filters)

  query.orderBy('billRuns.createdAt', 'desc').page(page - 1, DatabaseConfig.defaultPageSize)

  return query
}

function _applyFilters(query, filters) {
  const { yearCreated } = filters

  if (yearCreated) {
    query.whereRaw('EXTRACT(YEAR FROM bill_runs.created_at) = ?', [yearCreated])
  }
}

function _fetchQuery() {
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
}

module.exports = {
  go
}
