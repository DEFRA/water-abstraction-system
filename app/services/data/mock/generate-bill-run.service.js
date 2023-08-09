'use strict'

/**
 * Generates a mock bill run based on a real one
 * @module GenerateBillRunService
 */

const BillingBatchModel = require('../../../models/water/billing-batch.model.js')

async function go (id) {
  const realBillingBatch = await _fetchBillingBatch(id)

  if (!realBillingBatch) {
    throw new Error('No matching bill run exists')
  }

  return realBillingBatch
}

async function _fetchBillingBatch (id) {
  return BillingBatchModel.query()
    .findById(id)
    .withGraphFetched('billingInvoices')
    .withGraphFetched('billingInvoices.billingInvoiceLicences')
    .withGraphFetched('billingInvoices.billingInvoiceLicences.licence')
    .withGraphFetched('billingInvoices.billingInvoiceLicences.billingTransactions')
}

module.exports = {
  go
}
