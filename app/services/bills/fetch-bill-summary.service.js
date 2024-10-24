'use strict'

/**
 * Fetches data for the remove bill page which summarises the bill run and billing details for the bill
 * @module FetchBillSummaryService
 */

const BillModel = require('../../models/bill.model.js')

/**
 * Fetches data for the remove bill page which summarises the bill run and billing details for the bill
 *
 * Was built to provide the data needed for the '/bills/{id}/remove' page. We have to display the 'name' for
 * the billing account on the page. But this gets complex depending on whether there is a current billing account
 * address record, and if so does it have just a contact, or an agent company link.
 *
 * This is why the Objection query, though not complex does involve a number of `withGraphFetched()` calls.
 *
 * @param {string} billId - The UUID for the bill to fetch a summary of
 *
 * @returns {Promise<object>} the matching instance of BillModel plus the linked billing account and bill
 * run. Also all bill licences linked to the bill so we can display which licences are in the bill
 */
async function go (billId) {
  return _fetch(billId)
}

async function _fetch (billId) {
  return BillModel.query()
    .findById(billId)
    .select([
      'id',
      'netAmount'
    ])
    .withGraphFetched('billingAccount')
    .modifyGraph('billingAccount', (builder) => {
      builder.modify('contactDetails')
    })
    .withGraphFetched('billLicences')
    .modifyGraph('billLicences', (builder) => {
      builder.select([
        'id',
        'licenceRef'
      ])
        .orderBy([
          { column: 'licenceRef', order: 'asc' }
        ])
    })
    .withGraphFetched('billRun')
    .modifyGraph('billRun', (builder) => {
      builder.select([
        'id',
        'batchType',
        'billRunNumber',
        'createdAt',
        'scheme',
        'source',
        'status',
        'toFinancialYearEnding'
      ])
    })
    .withGraphFetched('billRun.region')
    .modifyGraph('billRun.region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })
}

module.exports = {
  go
}
