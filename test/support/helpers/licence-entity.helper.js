/**
 * @module LicenceEntityHelper
 */

import { generateUUID } from '../../../app/lib/general.lib.js'
import LicenceEntityModel from '../../../app/models/licence-entity.model.js'

/**
 * Add a new licence entity
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `name` - [random UUID]@example.co.uk
 * - `type` - individual
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceEntityModel>} The instance of the newly created record
 */
export async function add(data = {}) {
  const insertData = defaults(data)

  return LicenceEntityModel.query()
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
export function defaults(data = {}) {
  const defaults = {
    id: generateUUID(),
    name: generateName(),
    type: 'individual'
  }

  return {
    ...defaults,
    ...data
  }
}

/**
 * Generates a random name
 *
 * @returns {string} a random name in the format [random UUID]@example.co.uk
 */
export function generateName() {
  return `${generateUUID()}@example.co.uk`
}
