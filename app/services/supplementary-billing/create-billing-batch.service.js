'use strict'

/**
 * @module CreateBillingBatchService
 */

const { db } = require('../../../db/db.js')

class CreateBillingBatchService {
  /**
   * Add a new billing batch
   *
   * If no `data` is provided, default values will be used. These are
   *
   * - `region_id` - bd114474-790f-4470-8ba4-7b0cc9c225d7
   * - `batch_type` - supplementary
   * - `from_financial_year_ending` - 2023
   * - `to_financial_year_ending` - 2023
   * - `status` - processing
   * - `bill_run_number` - 99999
   * - `source` - wrls
   * - `scheme` - sroc
   *
   * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
   *
   * @returns {string} The ID of the newly created record
   */
  static async go (regionId, billingPeriod) {
    const billingBatchId = await db.table('water.billing_batches')
      .insert({
        region_id: regionId,
        batch_type: 'supplementary',
        from_financial_year_ending: billingPeriod.endDate.getFullYear(),
        to_financial_year_ending: billingPeriod.endDate.getFullYear(),
        status: 'processing',
        scheme: 'sroc'
      })
      .returning('billing_batch_id')

    return billingBatchId
  }
}

module.exports = CreateBillingBatchService
