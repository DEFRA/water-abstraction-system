'use strict'

/**
 * @module PointHelper
 */

const { generateRandomInteger } = require('../../../app/lib/general.lib.js')
const PointModel = require('../../../app/models/point.model.js')
const SourceHelper = require('./source.helper.js')

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

/**
 * Returns a randomly generated National Grid Reference NGR (TL 5143 7153)
 *
 * @returns {string} - A randomly National Grid Reference NGR
 */
function generateNationalGridReference() {
  // NOTE: These are taken from https://en.wikipedia.org/wiki/Ordnance_Survey_National_Grid and are the 100KM
  // square references that cover the majority of the UK (sorry far North!)
  const codes = ['SD', 'SE', 'SJ', 'SK', 'SO', 'SP', 'ST', 'SU', 'SY', 'SZ', 'TA', 'TF', 'TL', 'TQ', 'TV', 'TG', 'TM']

  return `${codes[generateRandomInteger(0, 16)]} ${generateRandomInteger(100, 999)} ${generateRandomInteger(100, 999)}`
}

/**
 * Returns a randomly generated NALD point ID (55944)
 *
 * @returns {string} - A randomly generated point ID
 */
function generateNaldPointId() {
  return generateRandomInteger(1, 99999)
}

module.exports = {
  add,
  defaults,
  generateNationalGridReference,
  generateNaldPointId
}
