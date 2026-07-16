/**
 * @module LicenceVersionPurposesHelper
 */

import GenerateHelper from './generate.helper.js'
import LicenceVersionPurposeModel from '../../../app/models/licence-version-purpose.model.js'
import PrimaryPurposeHelper from './primary-purpose.helper.js'
import PurposeHelper from './purpose.helper.js'
import SecondaryPurposeHelper from './secondary-purpose.helper.js'
import { generateUUID, timestampForPostgres } from '../../../app/lib/general.lib.js'

/**
 * Add a new licence version purpose
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `abstractionPeriodStartDay` - [1]
 * - `abstractionPeriodStartMonth` - [1]
 * - `abstractionPeriodEndDay` - [31]
 * - `abstractionPeriodEndMonth` - [3]
 * - `externalId` - [randomly generated - 9:99999]
 * - `licenceVersionId` - [random UUID]
 * - `primaryPurposeId` - [randomly selected UUID from primary purposes]
 * - `purposeId` - [randomly selected UUID from purposes]
 * - `secondaryPurposeId` - [randomly selected UUID from secondary purposes]
 * - `created` - new Date()
 * - `updated` - new Date()
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionPurposeModel>} The instance of the newly created record
 */
async function add(data = {}) {
  const insertData = defaults(data)

  return LicenceVersionPurposeModel.query()
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
  const { id: primaryPurposeId } = PrimaryPurposeHelper.select()
  const { id: purposeId } = PurposeHelper.select()
  const { id: secondaryPurposeId } = SecondaryPurposeHelper.select()
  const timestamp = timestampForPostgres()

  const defaults = {
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 1,
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    externalId: GenerateHelper.generateLicenceVersionPurposeExternalId(),
    licenceVersionId: generateUUID(),
    primaryPurposeId,
    purposeId,
    secondaryPurposeId,
    // INFO: The table does not have a default for the date columns
    createdAt: timestamp,
    updatedAt: timestamp
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
