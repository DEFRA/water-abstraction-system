'use strict'

/**
 * Creates a billing batch based on the regionId & billing period provided
 * @module CreateBillingBatchService
 */

const BillingBatchModel = require('../../models/billing-batch.model.js')

class CreateBillingBatchService {
  /**
   * Create a new billing batch
   *
   * @param {Object} [regionId] The region_id for the selected region
   * @param {Object} [billingPeriod] The billing period in the format { startDate: 2022-04-01, endDate: 2023-03-31 }
   *
   * @returns {Object} The newly created billing batch record
   */
  static async go (regionId, billingPeriod) {
    const billingBatch = await BillingBatchModel.query()
      .insert({
        region_id: regionId,
        batch_type: 'supplementary',
        from_financial_year_ending: billingPeriod.endDate.getFullYear(),
        to_financial_year_ending: billingPeriod.endDate.getFullYear(),
        status: 'processing',
        scheme: 'sroc'
      })
      .returning('*')

    return billingBatch
  }
}

module.exports = CreateBillingBatchService
