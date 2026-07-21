/**
 * @module ChargeElementHelper
 */

import ChargeElementModel from '../../../app/models/charge-element.model.js'
import PrimaryPurposeHelper from './primary-purpose.helper.js'
import PurposeHelper from './purpose.helper.js'
import SecondaryPurposeHelper from './secondary-purpose.helper.js'
import { generateUUID } from '../generators.js'

/**
 * Add a new charge element
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `chargeReferenceId` - [random UUID]
 * - `abstractionPeriodStartDay` - 1
 * - `abstractionPeriodStartMonth` - 4
 * - `abstractionPeriodEndDay` - 31
 * - `abstractionPeriodEndMonth` - 3
 * - `authorisedAnnualQuantity` - 200
 * - `loss` - low
 * - `factorsOverridden` - false
 * - `description` - Mineral washing
 * - `purposePrimaryId` - [randomly selected UUID from primary purposes]
 * - `purposeSecondaryId` - [randomly selected UUID from secondary purposes]
 * - `purposeId` - [randomly selected UUID from purposes]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ChargeElementModel>} The instance of the newly created record
 */
function add(data = {}) {
  const insertData = defaults(data)

  return ChargeElementModel.query()
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
  const { id: purposeId } = PurposeHelper.select()
  const { id: purposePrimaryId } = PrimaryPurposeHelper.select()
  const { id: purposeSecondaryId } = SecondaryPurposeHelper.select()

  const defaults = {
    chargeReferenceId: generateUUID(),
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    authorisedAnnualQuantity: 200,
    loss: 'low',
    factorsOverridden: false,
    description: 'Mineral washing',
    purposePrimaryId,
    purposeSecondaryId,
    purposeId
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
