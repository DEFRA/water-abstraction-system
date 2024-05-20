'use strict'

/**
 * @module ChargeVersionWorkflowHelper
 */

const ChargeVersionWorkflowModel = require('../../../app/models/charge-version-workflows.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Add a new charge version workflow
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `licenceRef` - [randomly generated - 01/123]
 * - `licenceId` - [random UUID]
 * - `licenceVersionId` - [random UUID]
 * - `status` - to_setup
 * - 'createdAt' - 2020-01-01

 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ChargeVersionWorkflowHelper>} The instance of the newly created record
 */
async function add (data = {}) {
  const insertData = defaults(data)

  return ChargeVersionWorkflowModel.query()
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
    licenceId: generateUUID(),
    licenceVersionId: generateUUID(),
    status: 'to_setup',
    createdAt: new Date('2020-01-01')
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
