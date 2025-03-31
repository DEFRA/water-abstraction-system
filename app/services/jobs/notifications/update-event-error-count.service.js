'use strict'

/**
 * Updates the error count for the provided events where scheduled notifications have errors.
 * @module UpdateEventErrorCountService
 */

const { db } = require('../../../../db/db.js')

/**
 * Updates the error count for the provided events where scheduled notifications have errors.
 *
 * > This service only updates the `event.metadata.error` where the id has been provided.
 *
 * This service will update the error count for an event where any related scheduled notifications have errors.
 *
 * It will override the current error count (if one is set).
 *
 * A scheduled notification can error on initial creation with Notify, these will be marked as an error.
 *
 * When a status update is requested for a scheduled notification (a successful request - no existing
 * error) and it errors (4xx or 5xx), this will not be marked as an error and is instead logged.
 *
 * Notify provides errors in the 'status' from the response data -
 * https://docs.notifications.service.gov.uk/node.html#get-the-status-of-multiple-messages-response. We consider these
 * errors and are included in the count.
 *
 * @param {string[]} eventIds - an array of event ids to update the error count for
 *
 * @returns {Promise<object[]>} - an array of 'scheduledNotifications'
 */
async function go(eventIds) {
  const query = _query(eventIds)

  return db.raw(query, [eventIds])
}

function _query() {
  return `
  WITH error_counts AS (
  SELECT
    sn.event_id AS eventId,
  COUNT(sn.status) AS error_count
  FROM public.scheduled_notifications sn
  WHERE sn.status = 'error'
    AND sn.event_id IS NOT NULL
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
