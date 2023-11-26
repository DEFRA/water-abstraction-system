'use strict'

/**
 * Fetches data needed for the bill run page which includes a summary for each bill linked to the bill run
 * @module FetchBillRunService
 */

const BillRunModel = require('../../models/water/bill-run.model.js')
const { db } = require('../../../db/db.js')

/**
 * Fetch the matching Bill Run plus a summary for each bill linked to it
 *
 * Was built to provide the data needed for the '/bill-runs/{id}' page
 *
 * @param {string} id The UUID for the bill run to fetch
 *
 * @returns {Object} the matching instance of BillRunModel plus a summary (Billing account number and contact, licence,
 * numbers, financial year and total net amount) for each bill linked to the bill run
 */
async function go (id) {
  const billRun = await _fetchBillRun(id)
  const billSummaries = await _fetchBillSummaries(id)

  return {
    billRun,
    billSummaries
  }
}

async function _fetchBillRun (id) {
  const result = BillRunModel.query()
    .findById(id)
    .select([
      'billingBatchId',
      'batchType',
      'billRunNumber',
      'creditNoteCount',
      'creditNoteValue',
      'dateCreated',
      'invoiceCount',
      'invoiceValue',
      'isSummer',
      'netTotal',
      'scheme',
      'source',
      'status',
      'toFinancialYearEnding',
      'transactionFileReference'
    ])
    .withGraphFetched('region')
    .modifyGraph('region', (builder) => {
      builder.select([
        'regionId',
        'displayName'
      ])
    })

  return result
}

/**
 * Query the DB and generate a summary for each bill linked to the bill run
 *
 * On the page we need to show the following in a table for every bill linked to the bill run
 *
 * - billing account number
 * - billing contact
 * - a list of licences references included in the bill
 * - financial year (displayed in supplementary bill runs)
 * - total net amount for the bill
 *
 * We also need to work out if any of the licences linked to a bill are flagged as 'water undertaker'. Historically,
 * annual bill runs display the bills grouped by 'Water companies' and 'Other abstractors'. So, if a bill is linked to
 * a licence that is flagged as a water undertaker that bill needs to be shown under 'Water companies'.
 *
 * Because we have to dip into a different schema to get billing account information Objection.js not available to us.
 * So, immediately we are required to use Knex. But then we have 2 sub-queries to perform
 *
 * - **get a list of linked licences as a single result** - Because a bill can be linked to 1 or more licences we can
 *  not use a JOIN. So, instead we use a function built into PostgreSQL that allows you to aggregate multiple results
 *  into a single value. (We can easily split them out again using JavaScripts `split()` method)
 * - **flag the bill as a water company** - Again we have to avoid joining to the `licences` table via
 *  `billing_invoice_licences` as we'll get duplicate results. So, again we use a PostgreSQL function that will return
 *  true or false based on the query provided to it.
 *
 * We could have made things simpler by performing separate queries and then transforming all the results into what we
 * need this service to return. But we opted to go for performance this time, avoiding multiple requests to the DB and
 * getting the query to provide the data we need without having to transform the result.
 */
async function _fetchBillSummaries (id) {
  const results = await db
    .select(
      'bi.billing_invoice_id',
      'bi.invoice_account_id',
      'bi.invoice_account_number',
      'bi.net_amount',
      'bi.financial_year_ending',
      db.raw('(c."name") AS company_name'),
      db.raw('(ac."name") AS agent_name'),
      db.raw(
        "(SELECT string_agg(bil.licence_ref, ',' ORDER BY bil.licence_ref) FROM water.billing_invoice_licences bil WHERE bil.billing_invoice_id = bi.billing_invoice_id GROUP BY bil.billing_invoice_id) AS all_licences"
      ),
      db.raw(
        '(EXISTS(SELECT 1 FROM water.licences l WHERE l.is_water_undertaker AND l.licence_id IN (SELECT bil2.licence_id FROM water.billing_invoice_licences bil2 WHERE bil2.billing_invoice_id = bi.billing_invoice_id))) AS water_company'
      )
    )
    .from('water.billing_invoices AS bi')
    .leftJoin('crm_v2.invoice_accounts AS ia', 'ia.invoice_account_id', 'bi.invoice_account_id')
    .leftJoin('crm_v2.companies AS c', 'c.company_id', 'ia.company_id')
    .leftJoin(
      'crm_v2.invoice_account_addresses AS iaa',
      function () {
        this.on('iaa.invoice_account_id', '=', 'ia.invoice_account_id').andOnNull('iaa.end_date')
      }
    )
    .leftJoin('crm_v2.companies AS ac', 'ac.company_id', 'iaa.agent_company_id')
    .where('bi.billing_batch_id', '=', id)
    .orderBy([
      { column: 'bi.invoice_account_number' },
      { column: 'bi.financial_year_ending', order: 'desc' }
    ])

  return results
}

module.exports = {
  go
}
