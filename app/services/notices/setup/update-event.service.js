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
 * If an error count already exists then we increment the error count with the provided value
 *
 * @param {string} id
 * @param {number} increaseErrorCount - The number of errors that occurred for the related 'notifications'.
 *
 */
async function go(id, increaseErrorCount = 0) {
  await EventModel.query()
    .findById(id)
    .patch({
      metadata: EventModel.raw("jsonb_set(metadata, ?, (COALESCE(metadata->>?, '0')::int + ?)::text::jsonb)", [
        `{error}`,
        'error',
        increaseErrorCount
      ]),
      updatedAt: timestampForPostgres()
    })
}

module.exports = {
  go
}
