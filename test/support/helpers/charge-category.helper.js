'use strict'

/**
 * @module ChargeCategoryHelper
 */

const ChargeCategoryModel = require('../../../app/models/charge-category.model.js')
const { randomInteger } = require('../general.js')

/**
 * Add a new charge category
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `reference` - [randomly generated - 4.4.5]
 * - `subsistenceCharge` - 12000
 * - `description` - Low loss non-tidal abstraction of restricted water up to and including 5,000 megalitres a year,
 *    where a Tier 1 model applies.
 * - `shortDescription` - Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model
 * - `tidal` - false
 * - `lossFactor` - low
 * - `modelTier` - tier 1
 * - `restrictedSource` - true
 * - `minVolume` - 0
 * - `maxVolume` - 5000,
 * - `dateCreated` - Date.now()
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ChargeCategoryModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ChargeCategoryModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {object} - Returns the set defaults with the override data spread
 */
function defaults (data = {}) {
  const defaults = {
    reference: generateChargeReference(),
    subsistenceCharge: 12000,
    description: 'Low loss non-tidal abstraction of restricted water up to and including 5,000 megalitres a year, where a Tier 1 model applies.',
    shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
    tidal: false,
    lossFactor: 'low',
    modelTier: 'tier 1',
    restrictedSource: true,
    minVolume: 0,
    maxVolume: 5000,
    // INFO: The billing_charge_categories table does not have a default for the date_created column. But it is set as
    // 'not nullable'! So, we need to ensure we set it when creating a new record, something we'll never actually need
    // to do because it's a static table. Also, we can't use Date.now() because Javascript returns the time since the
    // epoch in milliseconds, whereas a PostgreSQL timestamp field can only hold the seconds since the epoch. Pass it
    // an ISO string though ('2023-01-05T08:37:05.575Z') and PostgreSQL can do the conversion
    // https://stackoverflow.com/a/61912776/6117745
    createdAt: new Date().toISOString()
  }

  return {
    ...defaults,
    ...data
  }
}

/**
 * Generate Charge reference - e.g "4.6.42"
 *
 * A charge reference is built in three parts
 *
 * firstPart why - 4 (does it have a know range ? )
 * secondPart why - (1, 6)
 * thirdPart why - (1, 42)
 *
 * We see issues with this small range when tables have unique constraints when building the charge reference.
 *
 * The know range is commented above. But for the ease of testing this range has been extended.
 *
 * @returns {string} - randomly generated charge reference. Example - "4.6.42"
 */
function generateChargeReference () {
  const firstPart = randomInteger(1, 999999)
  const secondPart = randomInteger(1, 6)
  const thirdPart = randomInteger(1, 42)

  return `${firstPart}.${secondPart}.${thirdPart}`
}

module.exports = {
  add,
  defaults,
  generateChargeReference
}
