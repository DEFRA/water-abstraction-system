'use strict'

/**
 * Updates the error count for the provided events where notifications have errors.
 * @module UpdateEventErrorCountService
 */

const { db } = require('../../../../db/db.js')

/**
 * Updates the error count for the provided events where notifications have encountered errors.
 *
 * This service updates the `event.metadata.error` field for each event in the provided `eventIds` array. The error
 * count will be set based on the number of related notifications that have errors.
 *
 * **Error Conditions**:
 * - Errors occurring during the initial creation of notifications (e.g., via Notify) will be counted as
 * errors.
 * - Errors are identified based on the `status` field in the response data from Notify. If the response status
 * indicates an error, it is included in the error count (the notification status will have been set to
 * 'error').
 *
 * If a notification errors during a status update (e.g., receiving a 4xx or 5xx response), this is not
 * considered an error and will not be included in the error count (the status will not be 'error'). Instead, this type
 * of error will be logged.
 *
 * **Important Notes**:
 * - This function will override any existing error count in the `event.metadata.error` field.
 * - It only updates the error count for events whose `eventIds` are provided.
 *
 * **Reference**:
 * - For more information about error statuses from Notify, refer to the documentation:
 * [Get the status of multiple messages](https://docs.notifications.service.gov.uk/node.html#get-the-status-of-multiple-messages-response).
 *
 * @param {string[]} eventIds - an array of event ids to update the error count for
 *
 */
async function go(eventIds) {
  const query = _query()

  await db.raw(query, [eventIds, eventIds])
}

function _query() {
  return `
  WITH error_counts AS (
  SELECT
    sn.event_id AS eventId,
  COUNT(sn.status) AS error_count
  FROM public.notifications sn
  WHERE sn.status = 'error'
    AND sn.event_id = ANY(?)
  GROUP BY sn.event_id
    )
  UPDATE public.events e
  SET metadata = jsonb_set(
    e.metadata,
    '{error}',
    to_jsonb(ec.error_count),
    true
    )
  FROM error_counts ec
  WHERE e.id = ec.eventId
    AND e.type = 'notification'
    AND e.id = ANY(?);`
}

module.exports = {
  go
}
