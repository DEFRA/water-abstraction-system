'use strict'

/**
 * @module ChargeVersionNoteHelper
 */

const { generateUserId } = require('./user.helper.js')
const ChargeVersionNoteModel = require('../../../app/models/charge-version-note.model.js')

/**
 * Add a new charge version note
 *
 * If no `data` is provided, the default values will be used. These are
 *
 * - `note` - 'This is a test note'
 * - `userId` - [randomly generated - 100001]
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:NoteModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ChargeVersionNoteModel.query()
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
  const defaults = {
    note: 'This is a test note',
    userId: generateUserId()
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
