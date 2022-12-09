'use strict'

/**
 * @module BillingBatchHelper
 */

const { db } = require('../../../db/db.js')

class BillingBatchHelper {
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
   * - `scheme` - sroc
   *
   * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
   *
   * @returns {string} The ID of the newly created record
   */
  static async add (data = {}) {
    const insertData = this.defaults(data)

    const result = await db.table('water.billing_batches')
      .insert(insertData)
      .returning('billing_batch_id')

    return result
  }

  /**
   * Returns the defaults used when creating a new billing batch
   *
   * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
   * for use in tests to avoid having to duplicate values.
   *
   * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
   */
  static defaults (data = {}) {
    const defaults = {
      region_id: 'bd114474-790f-4470-8ba4-7b0cc9c225d7',
      batch_type: 'supplementary',
      from_financial_year_ending: 2023,
      to_financial_year_ending: 2023,
      status: 'processing',
      scheme: 'sroc'
    }

    return {
      ...defaults,
      ...data
    }
  }
}

module.exports = BillingBatchHelper
