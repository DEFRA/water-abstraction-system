'use strict'

/**
 * Fetches the matching billing account and additional records needed for the view billing accounts page
 * @module FetchViewBillingAccountService
 */

const { db } = require('../../../db/db.js')
const { ref } = require('objection')

const BillingAccountModel = require('../../models/billing-account.model.js')
const BillModel = require('../../models/bill.model.js')

const DatabaseConfig = require('../../../config/database.config.js')

/**
 * Fetches the matching billing account and additional records needed for the view billing accounts page
 *
 * @param {string} billingAccountId - The UUID for the billing account to fetch
 * @param {number|string} page - The current page for the pagination service
 *
 * @returns {Promise<module:BillingAccountModel>} the matching instance of `BillingAccountModel` populated with
 * the data needed for the view billing account page
 */
async function go(billingAccountId, page) {
  const billingAccount = await _fetchBillingAccount(billingAccountId)
  const { results, total } = await _fetchBills(billingAccountId, page)
  const licenceId = await _fetchLicence(billingAccountId)

  return {
    billingAccount,
    bills: results,
    licenceId,
    pagination: {
      total
    }
  }
}

async function _fetchBillingAccount(billingAccountId) {
  return BillingAccountModel.query()
    .findById(billingAccountId)
    .select(['id', 'accountNumber', 'createdAt'])
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
    .select([
      'id',
      'createdAt',
      'credit',
      'invoiceNumber',
      ref('bills.metadata:FIN_YEAR').castInt().as('financialYear'),
      'netAmount'
    ])
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

async function _fetchLicence(billingAccountId) {
  const result = await db
    .withSchema('public')
    .select('l.id AS licenceId')
    .distinct()
    .from('licences AS l')
    .innerJoin('billLicences as bl', 'l.id', '=', 'bl.licenceId')
    .innerJoin('bills as b', 'bl.billId', '=', 'b.id')
    .where('b.billingAccountId', '=', billingAccountId)

  return result[0].licenceId
}

module.exports = {
  go
}
