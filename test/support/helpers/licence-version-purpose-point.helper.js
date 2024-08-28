'use strict'

/**
 * @module LicenceVersionPurposePointHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { randomInteger } = require('../general.js')
const LicenceVersionPurposePointModel = require('../../../app/models/licence-version-purpose-point.model.js')
const { generateNaldPointId, generateNationalGridReference } = require('./return-requirement-point.helper.js')

/**
 * Add a new licence version purpose point
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `externalId` - [randomly generated - 9:99999:100414]
 * - `licenceVersionPurposeId` - [random UUID]
 * - `naldPointId` - [randomly generated - 100414]
 * - `ngr1` - [randomly generated - TL 5143 7153]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:LicenceVersionPurposePointModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return LicenceVersionPurposePointModel.query()
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
  const naldPointId = data.naldPointId ? data.naldPointId : generateNaldPointId()
  const ngr1 = data.ngr1 ? data.ngr1 : generateNationalGridReference()

  const defaults = {
    description: 'Point description',
    externalId: `9:${randomInteger(100, 99999)}:${naldPointId}`,
    licenceVersionPurposeId: generateUUID(),
    naldPointId,
    ngr1
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
