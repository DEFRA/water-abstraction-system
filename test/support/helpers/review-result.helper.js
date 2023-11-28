'use strict'

/**
 * @module ReviewResultHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const ReviewResultModel = require('../../../app/models/review-result.model.js')

/**
 * Add a new review result record for 2pt matching
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `billRunId` - [random UUID]
 * - `licenceId` - [random UUID]
 * - `chargeVersionId` - [random UUID]
 * - `chargeReferenceId` - [random UUID]
 * - chargePeriodStartDate - 2022-04-01
 * - chargePeriodEndDate - 2022-06-05
 * - chargeVersionChangeReason - 'Strategic review of charges (SRoC)'
 * - `reviewChargeElementResultId` - [random UUID]
 * - `reviewReturnResultId` - [random UUID]
 * - updatedAt - new Date()
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:ReviewResultModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReviewResultModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here in the database
 */
function defaults (data = {}) {
  const defaults = {
    id: generateUUID(),
    billRunId: generateUUID(),
    licenceId: generateUUID(),
    chargeVersionId: generateUUID(),
    chargeReferenceId: generateUUID(),
    chargePeriodStartDate: new Date('2022-04-01'),
    chargePeriodEndDate: new Date('2022-06-05'),
    chargeVersionChangeReason: 'Strategic review of charges (SRoC)',
    reviewChargeElementResultId: generateUUID(),
    reviewReturnResultId: generateUUID(),
    updatedAt: new Date()
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
