'use strict'

/**
 * @module NoteHelper
 */

const { generateUserId } = require('./user.helper.js')
const NoteModel = require('../../../app/models/note.model.js')

/**
 * Add a new note
 *
 * If no `data` is provided, the default values will be used. These are
 *
 * - `note` - 'This is a test note'
 * - `userId` - [randomly generated - 100001]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:NoteModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return NoteModel.query()
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
