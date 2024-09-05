'use strict'

/**
 * @module ReturnRequirementPointHelper
 */

const { generateUUID } = require('../../../app/lib/general.lib.js')
const { randomInteger } = require('../general.js')
const ReturnRequirementPointModel = require('../../../app/models/return-requirement-point.model.js')

/**
 * Add a new return requirement point
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `externalId` - [randomly generated - 9:99999:100414]
 * - `naldPointId` - [randomly generated - 100414]
 * - `ngr1` - [randomly generated - TL 5143 7153]
 * - `returnRequirementId` - [random UUID]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ReturnRequirementPointModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ReturnRequirementPointModel.query()
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
    naldPointId,
    ngr1,
    returnRequirementId: generateUUID()
  }

  return {
    ...defaults,
    ...data
  }
}

function generateNationalGridReference () {
  // NOTE: These are taken from https://en.wikipedia.org/wiki/Ordnance_Survey_National_Grid and are the 100KM
  // square references that cover the majority of the UK (sorry far North!)
  const codes = ['SD', 'SE', 'SJ', 'SK', 'SO', 'SP', 'ST', 'SU', 'SY', 'SZ', 'TA', 'TF', 'TL', 'TQ', 'TV', 'TG', 'TM']

  return `${codes[randomInteger(0, 16)]} ${randomInteger(100, 999)} ${randomInteger(100, 999)}`
}

function generateNaldPointId () {
  return randomInteger(1, 9999)
}

module.exports = {
  add,
  defaults,
  generateNationalGridReference,
  generateNaldPointId
}
