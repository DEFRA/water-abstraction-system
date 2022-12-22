'use strict'

/**
 * @module BillingBatchHelper
 */

const BillingBatchModel = require('../../../app/models/billing-batch.model.js')

/**
 * Add a new billing batch
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `regionId` - bd114474-790f-4470-8ba4-7b0cc9c225d7
 * - `batchType` - supplementary
 * - `fromFinancialYearEnding` - 2023
 * - `toFinancialYearEnding` - 2023
 * - `status` - processing
 * - `scheme` - sroc
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:BillingBatchModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return BillingBatchModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used when creating a new billing batch
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    regionId: 'bd114474-790f-4470-8ba4-7b0cc9c225d7',
    batchType: 'supplementary',
    fromFinancialYearEnding: 2023,
    toFinancialYearEnding: 2023,
    status: 'processing',
    scheme: 'sroc'
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
