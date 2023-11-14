'use strict'

/**
 * Fetches data needed for the bill page which includes a summary for each licence linked to the bill
 * @module FetchBillService
 */

const BillModel = require('../../models/water/bill.model.js')
const { db } = require('../../../db/db.js')

/**
 * Fetch the matching Bill plus a summary for each licence linked to it
 *
 * Was built to provide the data needed for the '/bills/{id}' page
 *
 * @param {string} id The UUID for the bill to fetch
 *
 * @returns {Object} the matching instance of BillModel plus a summary (ID, reference, and total net amount) for each
 * licence linked to the bill
 */
async function go (id) {
  const bill = await _fetchBill(id)
  const licenceSummaries = await _fetchLicenceSummaries(id)

  return {
    bill,
    licenceSummaries
  }
}

async function _fetchBill (id) {
  const result = BillModel.query()
    .findById(id)
    .select([
      'billingInvoiceId',
      'creditNoteValue',
      'dateCreated',
      'financialYearEnding',
      'invoiceAccountId',
      'invoiceNumber',
      'invoiceValue',
      'isCredit',
      'isFlaggedForRebilling',
      'netAmount',
      'rebillingState',
      'isDeMinimis'
    ])
    .withGraphFetched('billRun')
    .modifyGraph('billRun', (builder) => {
      builder.select([
        'billingBatchId',
        'batchType',
        'dateCreated',
        'status',
        'billRunNumber',
        'transactionFileReference',
        'scheme',
        'isSummer',
        'source'
      ])
    })
    .withGraphFetched('billRun.region')
    .modifyGraph('billRun.region', (builder) => {
      builder.select([
        'regionId',
        'displayName'
      ])
    })

  return result
}

/**
 * Query the DB and generate a distinct summarised result for each licence
 *
 * Licences are linked to a bill (billing_invoice) via bill licences (billing_invoice_licences). But the bill licence
 * doesn't contain any data, for example, the total for all transactions for the linked licence.
 *
 * The page requires us to show the total for each licence which means we need to calculate this by totalling the
 * net amount on each linked transaction.
 *
 * To get the query to return a single line for each licence we need to use DISTINCT. So, due to the complexity of the
 * query needed we've had to drop back down to Knex and generate the query ourselves rather than going through
 * Objection.js.
 */
async function _fetchLicenceSummaries (id) {
  const results = await db
    .distinct(['bil.billingInvoiceLicenceId', 'bil.licenceRef'])
    .sum('bt.net_amount AS total')
    .from('water.billingInvoiceLicences AS bil')
    .innerJoin('water.billing_transactions AS bt', 'bil.billingInvoiceLicenceId', 'bt.billingInvoiceLicenceId')
    .where('bil.billingInvoiceId', id)
    .where('bt.chargeType', 'standard')
    .groupBy('bil.billingInvoiceLicenceId', 'bil.licenceRef')
    .orderBy('bil.licenceRef')

  return results
}

module.exports = {
  go
}
