'use strict'

/**
 * Fetches the matching billing account and additional records needed for the view billing account page
 * @module FetchViewBillingAccountService
 */

const BillingAccountModel = require('../../models/billing-account.model.js')
const BillModel = require('../../models/bill.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the matching billing account and additional records needed for the view billing account page
 *
 * @param {string} id - The UUID for the billing account to fetch
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<object>} an object containing the billing account and matching bills needed to populate the view
 * billing account page
 */
async function go(id, page) {
  const billingAccount = await _fetchBillingAccount(id)
  const { results, total } = await _fetchBills(id, page)

  return {
    billingAccount,
    bills: results,

    pagination: {
      total
    }
  }
}

async function _fetchBillingAccount(id) {
  return BillingAccountModel.query()
    .findById(id)
    .select(['id', 'accountNumber', 'createdAt', 'lastTransactionFile', 'lastTransactionFileCreatedAt'])
    .withGraphFetched('billingAccountAddresses')
    .modifyGraph('billingAccountAddresses', (builder) => {
      builder.select('id')
    })
    .withGraphFetched('company')
    .modifyGraph('company', (builder) => {
      builder.select(['id', 'name'])
    })
    .withGraphFetched('billingAccountAddresses.address')
    .modifyGraph('billingAccountAddresses.address', (builder) => {
      builder.select(['id', 'address1', 'address2', 'address3', 'address4', 'address5', 'address6', 'postcode'])
    })
}

async function _fetchBills(billingAccountId, page) {
  return BillModel.query()
    .select(['id', 'createdAt', 'credit', 'financialYearEnding', 'invoiceNumber', 'netAmount'])
    .withGraphFetched('billRun')
    .modifyGraph('billRun', (builder) => {
      builder.select(['id', 'batchType', 'billRunNumber', 'scheme', 'source', 'summer'])
    })
    .orderBy([
      { column: 'createdAt', order: 'desc' },
      { column: 'invoiceNumber', order: 'asc' }
    ])
    .where('billingAccountId', billingAccountId)
    .page(page - 1, DatabaseConfig.defaultPageSize)
}

module.exports = {
  go
}
