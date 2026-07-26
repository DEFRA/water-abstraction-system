/**
 * @module ChargeReferenceHelper
 */

import ChargeCategoryHelper from './charge-category.helper.js'
import ChargeReferenceModel from '../../../app/models/charge-reference.model.js'
import { generateUUID } from '../generators.js'

/**
 * Add a new charge reference
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `chargeVersionId` - [random UUID]
 * - `source` - non-tidal
 * - `loss` - low
 * - `volume` - 200 [if scheme is not 'alcs', otherwise null]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ChargeReferenceModel>} The instance of the newly created record
 */
function add(data = {}) {
  const insertData = defaults(data)

  return ChargeReferenceModel.query()
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
function defaults(data = {}) {
  const { id: chargeCategoryId } = ChargeCategoryHelper.select()

  // The table has a constraint that either authorisedAnnualQuantity or volume must be populated. But if the scheme is
  // 'alcs' (PRESROC) volume should be null. As most of our tests are for SROC, we default to 200 for volume unless the
  // scheme is 'alcs'.
  const volume = data.scheme === 'alcs' ? null : 200

  const defaults = {
    chargeVersionId: generateUUID(),
    source: 'non-tidal',
    loss: 'low',
    volume
  }

  return {
    ...defaults,
    ...data
  }
}

export default {
  add,
  defaults
}
