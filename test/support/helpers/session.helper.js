'use strict'

/**
 * @module SessionHelper
 */

const SessionModel = require('../../../app/models/session.model.js')

/**
 * Add a new session
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `data` - [empty object {}]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:SessionModel>} The instance of the newly created record
 */
function add(data = {}) {
  const insertData = defaults(data)

  return SessionModel.query()
    .insert({ ...insertData })
    .returning('*')
}

/**
 * Returns the defaults used
 *
 * It will override or append to them any data provided. Mainly used by the `add()` method, we make it available
 * for use in tests to avoid having to duplicate values.
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here in the database
 *
 * @returns {object} - Returns data from the query
 */
function defaults(data = {}) {
  const defaults = {}

  return {
    ...defaults,
    ...data
  }
}

module.exports = {
  add,
  defaults
}
