'use strict'

/**
 * @module ContactHelper
 */

const ContactModel = require('../../../app/models/contact.model.js')

/**
 * Add a new contact
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `firstName` - Amara
 * - `lastName` - Gupta
 * - `dataSource` - wrls
 * - `contactType` - person
 * - `email` - amara.gupta@example.com
 *
 * @param {object} [data] - Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ContactModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ContactModel.query()
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
    firstName: 'Amara',
    lastName: 'Gupta',
    dataSource: 'wrls',
    contactType: 'person',
    email: 'amara.gupta@example.com'
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
