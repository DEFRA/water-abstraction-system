'use strict'

/**
 * Update the 'metadata.error' field for a specific event.
 * @module UpdateEventService
 */

const EventModel = require('../../../../app/models/event.model.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Update the 'metadata.error' field for a specific event.
 *
 * This function updates the 'metadata.error' value for the event with the specified ID.
 * The error count is captured after sending notifications to the Notify service,
 * and the value aligns with existing legacy code for reporting.
 *
 * The event's metadata is a JSON object, and this function specifically updates the
 * 'error' key in that metadata. This is used to track the number of errors for the
 * related 'notifications'.
 *
 * @param {string} id
 * @param {number} errorCount - The number of errors that occurred for the related 'notifications'.
 *
 */
async function go(id, errorCount) {
  await EventModel.query()
    .findById(id)
    .patch({
      metadata: EventModel.raw('jsonb_set(metadata, ?, ?)', [`{error}`, JSON.stringify(errorCount)]),
      updatedAt: timestampForPostgres()
    })
}

module.exports = {
  go
}
