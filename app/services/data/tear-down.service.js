'use strict'

/**
 * Does stuff
 * @module TearDownService
 */

const { db } = require('../../../db/db.js')

async function go () {
  const billingInvoiceLicencesToDelete = await _deleteBillingTransactions()
  console.log('🚀 ~ file: tear-down.service.js:13 ~ go ~ billingInvoiceLicencesToDelete:', billingInvoiceLicencesToDelete)

  return billingInvoiceLicencesToDelete
}

async function _deleteBillingTransactions () {
  return db
    .from('water.billingTransactions as bt')
    .innerJoin('water.billingInvoiceLicences as bil', 'bt.billingInvoiceLicenceId', 'bil.billingInvoiceLicenceId')
    .innerJoin('water.billingInvoices as bi', 'bil.billingInvoiceId', 'bi.billingInvoiceId')
    .innerJoin('water.billingBatches as bb', 'bi.billingBatchId', 'bb.billingBatchId')
    .innerJoin('water.regions as r', 'bb.regionId', 'r.regionId')
    // .where('r.isTest', true)
    .where('bt.description', 'test')
    .del(['bt.billingInvoiceLicenceId'])
}

module.exports = {
  go
}
