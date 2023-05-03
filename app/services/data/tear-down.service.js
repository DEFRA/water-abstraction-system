'use strict'

/**
 * Does stuff
 * @module TearDownService
 */

const { db } = require('../../../db/db.js')

async function go () {
  await _deleteBilling()

  return 'Data deleted'
}

async function _deleteBilling () {
  // Delete billingtransactions
  const billingInvoiceLicences = await db
    .from('water.billingTransactions as bt')
    .innerJoin('water.billingInvoiceLicences as bil', 'bt.billingInvoiceLicenceId', 'bil.billingInvoiceLicenceId')
    .innerJoin('water.billingInvoices as bi', 'bil.billingInvoiceId', 'bi.billingInvoiceId')
    .innerJoin('water.billingBatches as bb', 'bi.billingBatchId', 'bb.billingBatchId')
    .innerJoin('water.regions as r', 'bb.regionId', 'r.regionId')
    .where('r.isTest', true)
    // .where('bt.description', 'test')
    .del(['bt.billingInvoiceLicenceId'])

  const billingInvoiceLicenceIds = billingInvoiceLicences.map((billingInvoiceLicence) => {
    return billingInvoiceLicence.billingInvoiceLicenceId
  })

  // Delete billingInvoiceLicences
  const billingInvoices = await db
    .from('water.billingInvoiceLicences')
    .whereIn('billingInvoiceLicenceId', billingInvoiceLicenceIds)
    .del(['billingInvoiceId'])

  const billingInvoiceIds = billingInvoices.map((billingInvoice) => {
    return billingInvoice.billingInvoiceId
  })

  // Delete billingInvoices
  const billingBatches = await db
    .from('water.billingInvoices')
    .whereIn('billingInvoiceId', billingInvoiceIds)
    .del(['billingBatchId'])

  const billingBatchIds = billingBatches.map((billingBatch) => {
    return billingBatch.billingBatchId
  })

  // Delete billingBatchChargeVersionYears
  await db
    .from('water.billingBatchChargeVersionYears')
    .whereIn('billingBatchId', billingBatchIds)
    .del()

  // Delete billingVolumes
  await db
    .from('water.billingVolumes')
    .whereIn('billingBatchId', billingBatchIds)
    .del()

  // Delete billingBatches
  await db
    .from('water.billingBatches')
    .whereIn('billingBatchId', billingBatchIds)
    .del()
}

module.exports = {
  go
}
