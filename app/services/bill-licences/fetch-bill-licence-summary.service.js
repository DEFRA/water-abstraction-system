'use strict'

/**
 * Fetches data for the remove bill licence page which summarises the bill run and billing details for the licence
 * @module FetchBillLicenceService
 */

const BillLicenceModel = require('../../models/bill-licence.model.js')

/**
 * Fetches data for the remove bill licence page which summarises the bill run and billing details for the licence
 *
 * Was built to provide the data needed for the '/bill-licences/{id}/remove' page. We have to display the 'name' for
 * the billing account on the page. But this gets complex depending on whether there is a current billing account
 * address record, and if so does it have just a contact, or an agent company link.
 *
 * This is why the Objection query, though not complex does involve a number of `withGraphFetched()` calls.
 *
 * @param {string} billLicenceId - The UUID for the bill licence to fetch a summary of
 *
 * @returns {Promise<object>} the matching instance of BillLicenceModel plus the linked bill, billing account and bill
 * run. Also all transactions linked to the bill licence so we can work out the total for the licence
 */
async function go (billLicenceId) {
  return _fetchBillLicence(billLicenceId)
}

async function _fetchBillLicence (billLicenceId) {
  const results = await BillLicenceModel.query()
    .findById(billLicenceId)
    .select([
      'id',
      'licenceId',
      'licenceRef'
    ])
    .withGraphFetched('bill')
    .modifyGraph('bill', (builder) => {
      builder.select([
        'id',
        'accountNumber'
      ])
    })
    .withGraphFetched('bill.billingAccount')
    .modifyGraph('bill.billingAccount', (builder) => {
      builder.select([
        'id',
        'accountNumber'
      ])
    })
    .withGraphFetched('bill.billingAccount.company')
    .modifyGraph('bill.billingAccount.company', (builder) => {
      builder.select([
        'id',
        'name',
        'type'
      ])
    })
    .withGraphFetched('bill.billingAccount.billingAccountAddresses')
    // The current billing account address is denoted by the fact it is the only one with a null end date
    .modifyGraph('bill.billingAccount.billingAccountAddresses', (builder) => {
      builder
        .select([
          'id'
        ])
        .whereNull('endDate')
    })
    .withGraphFetched('bill.billingAccount.billingAccountAddresses.company')
    .modifyGraph('bill.billingAccount.billingAccountAddresses.company', (builder) => {
      builder.select([
        'id',
        'name',
        'type'
      ])
    })
    .withGraphFetched('bill.billingAccount.billingAccountAddresses.contact')
    .modifyGraph('bill.billingAccount.billingAccountAddresses.contact', (builder) => {
      builder.select([
        'id',
        'contactType',
        'dataSource',
        'department',
        'firstName',
        'initials',
        'lastName',
        'middleInitials',
        'salutation',
        'suffix'
      ])
    })
    .withGraphFetched('bill.billRun')
    .modifyGraph('bill.billRun', (builder) => {
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
    .withGraphFetched('bill.billRun.region')
    .modifyGraph('bill.billRun.region', (builder) => {
      builder.select([
        'id',
        'displayName'
      ])
    })
    .withGraphFetched('transactions')
    .modifyGraph('transactions', (builder) => {
      builder.select([
        'id',
        'credit',
        'netAmount'
      ])
    })

  return results
}

module.exports = {
  go
}
