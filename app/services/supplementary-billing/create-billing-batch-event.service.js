'use strict'

/**
 * Creates an event based on the type, subtype, issuer, metadata & status provided
 * @module CreateEventService
 */

const EventModel = require('../../models/event.model.js')

/**
 * Create a new event
 *
 * @param {String} [type] The type of event, for example `billing-batch`
 * @param {String} [subtype] The subtype of the type, for example `supplementary' or `annual`
 * @param {String} [issuer] The email address of the user triggering the event
 * @param {Object} [metadata] Object containing data relating to the event
 * @param {String} [status] The status of the event, for example `start`, `delete`, `sent`, `completed`, `created`
 *
 * @returns {Object} The newly created event record
 */
async function go (type, subtype, issuer, metadata, status) {
  const event = await EventModel.query()
    .insert({
      type,
      subtype,
      issuer,
      metadata,
      status
    })
    .returning('*')

  return event
}

module.exports = {
  go
}
