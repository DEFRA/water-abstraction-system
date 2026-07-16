/**
 * @module PointHelper
 */

import PointModel from '../../../app/models/point.model.js'
import SourceHelper from './source.helper.js'
import { generateNaldPointId, generateNationalGridReference } from '../generators.js'

/**
 * Add a new licence version purpose point
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `description` - WELL AT WELLINGTON
 * - `externalId` - [randomly generated - 9:99999]
 * - `ngr1` - [randomly generated - TL 5143 7153]
 * - `sourceId` - [randomly selected UUID from source]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:PointModel>} The instance of the newly created record
 */
function add(data = {}) {
  const insertData = defaults(data)

  return PointModel.query()
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
  const { id: sourceId } = SourceHelper.select()
  const naldPointId = data.naldPointId ? data.naldPointId : generateNaldPointId()
  const ngr1 = data.ngr1 ? data.ngr1 : generateNationalGridReference()

  const defaults = {
    description: 'WELL AT WELLINGTON',
    externalId: `9:${naldPointId}`,
    ngr1,
    sourceId
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
