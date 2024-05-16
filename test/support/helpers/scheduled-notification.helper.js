'use strict'

/**
 * @module ScheduledNotificationHelper
 */

const ScheduledNotificationModel = require('../../../app/models/scheduled-notification.model.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

/**
 * Add a new company contact
 *
 * If no `data` is provided, default values will be used. These are
 *
 * - `id` - [random UUID]
 * - `event_id` - [random UUID]
 *
 * @param {Object} [data] Any data you want to use instead of the defaults used here or in the database
 *
 * @returns {Promise<module:ScheduledNotificationModel>} The instance of the newly created record
 */
function add (data = {}) {
  const insertData = defaults(data)

  return ScheduledNotificationModel.query()
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
    eventId: generateUUID(),
    notifyStatus: 'delivered'
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
