'use strict'

/**
 * @module TransactionHelper
 */

const { generateChargeReference } = require('./charge-category.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const TransactionModel = require('../../../../app/models/water/transaction.model.js')

/**
 * Add a new transaction
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `adjustmentFactor` - 1
 * - `aggregateFactor` - 1
 * - `authorisedDays` - 365
 * - `authorisedQuantity` - 11
 * - `billableDays` - 365
 * - `billableQuantity` - 11
 * - `billingInvoiceLicenceId` - [random UUID]
 * - `chargeCategoryCode` - [randomly generated - 4.4.5]
 * - `chargeCategoryDescription` - Medium loss, non-tidal, restricted water, up to and including 25 ML/yr, Tier 2 model
 * - `chargeType` - standard,
 * - `description` - Water abstraction charge: Agriculture other than spray irrigation at East Rudham
 * - `isCredit` - false
 * - `loss` - medium
 * - `season` - all year
 * - `section130Agreement` - false
 * - `scheme` - sroc
 * - `source` - non-tidal
 * - `volume` - 11
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {module:TransactionModel} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return TransactionModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 */
function defaults (data = {}) {
  const defaults = {
    adjustmentFactor: 1,
    aggregateFactor: 1,
    authorisedDays: 365,
    authorisedQuantity: 11,
    billableDays: 365,
    billableQuantity: 11,
    billingInvoiceLicenceId: generateUUID(),
    chargeCategoryCode: generateChargeReference(),
    chargeCategoryDescription: 'Medium loss, non-tidal, restricted water, up to and including 25 ML/yr, Tier 2 model',
    chargeType: 'standard',
    description: 'Water abstraction charge: Agriculture other than spray irrigation at East Rudham',
    isCredit: false,
    loss: 'medium',
    season: 'all year',
    section130Agreement: 'false',
    scheme: 'sroc',
    source: 'non-tidal',
    volume: 11
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
