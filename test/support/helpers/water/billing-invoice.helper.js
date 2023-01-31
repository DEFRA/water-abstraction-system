'use strict'

/**
 * @module BillingInvoiceHelper
 */

const BillingInvoiceModel = require('../../../../app/models/water/billing-invoice.model.js')
const BillingBatchHelper = require('./billing-batch.helper.js')

/**
 * Add a new billing invoice
 *
 * A billing invoice is always linked to a billing batch. So, creating a billing invoice will automatically
 * create a new billing batch and handle linking the two together by `billingBatchId`. If a `financialYearEnding` has
 * been provided for the billing invoice, but not for the billing batch. The billing batch will use the 'financialYearEnding'
 * from the billing invoice to populate it's `fromFinancialYearEnding` & `toFinancialYearEnding` items.
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `financialYearEnding` - 2023
 *
 * See `BillingBatchHelper` for the billing batch defaults
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 * @param {Object} [billingBatch] Any billing batch data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingInvoiceModel} The instance of the newly created record
 */
async function add (data = {}, billingBatch = {}) {
  if (data.financialYearEnding && !billingBatch.fromFinancialYearEnding) {
    billingBatch.fromFinancialYearEnding = data.financialYearEnding
    billingBatch.toFinancialYearEnding = data.financialYearEnding
  }

  const billingBatchId = await _billingBatchId(billingBatch)

  const insertData = defaults({ ...data, billingBatchId })

  return BillingInvoiceModel.query()
    .insert({ ...insertData })
    .returning('*')
}

async function _billingBatchId (providedBillingBatch) {
  if (providedBillingBatch?.billingBatchId) {
    return providedBillingBatch.billingBatchId
  }

  const billingBatch = await BillingBatchHelper.add(providedBillingBatch)

  return billingBatch.billingBatchId
}

/**
 * Returns the defaults used when creating a new billing invoice
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    financialYearEnding: 2023
  }

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  add,
  defaults
}
