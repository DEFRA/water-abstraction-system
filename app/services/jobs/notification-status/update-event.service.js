'use strict'

/**
 * Updates the status counts and determines the overall status for the provided events.
 * @module UpdateEventErrorCountService
 */

const { db } = require('../../../../db/db.js')

/**
 * Updates the status counts and determines the overall status for the provided events.
 *
 * This service sets the `event.overall_status` based on the statuses of the associated notifications. The logic used to
 * determine the overall status is as follows:
 * - If one notification has a status of returned, then show "returned"
 * - If no notifications are returned, but one has a status of error, then show "error"
 * - If no notifications are returned or errored, but one has a status of pending, then show "pending"
 * - If no notifications are returned, errored, or pending, then show "sent"
 *
 * The `event.status_counts` field is updated to provide a breakdown of the counts of each notification status.
 *
 * This service also updates the `event.metadata.error` field for each event in the provided `eventIds` array. The error
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

  await db.raw(query, [eventIds])
}

function _query() {
  return `
  UPDATE public.events e
  SET
    metadata = jsonb_set(
      e.metadata,
      '{error}',
      to_jsonb(os.error_count),
      true
      ),
    overall_status = os.overall_status,
    status_counts = os.status_counts
  FROM (
    SELECT
      n.event_id,
      COUNT(*) FILTER (WHERE n.status = 'error') AS error_count,
      CASE
        WHEN COUNT(*) FILTER (WHERE n.status = 'returned') > 0 THEN 'returned'
        WHEN COUNT(*) FILTER (WHERE n.status = 'error') > 0 THEN 'error'
        WHEN COUNT(*) FILTER (WHERE n.status = 'pending') > 0 THEN 'pending'
        ELSE 'sent'
      END AS overall_status,
      jsonb_build_object(
        'returned', COUNT(*) FILTER (WHERE n.status = 'returned'),
        'error', COUNT(*) FILTER (WHERE n.status = 'error'),
        'pending', COUNT(*) FILTER (WHERE n.status = 'pending'),
        'sent', COUNT(*) FILTER (WHERE n.status = 'sent')
      ) AS status_counts
    FROM public.notifications n
    GROUP BY n.event_id
  ) os
  WHERE e.type = 'notification'
  AND e.id = os.event_id
  AND e.id = ANY(?);
  `
}

module.exports = {
  go
}
