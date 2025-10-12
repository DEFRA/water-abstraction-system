'use strict'

/**
 * Updates the status counts and determines the overall status for the provided events
 * @module UpdateEventService
 */

const { db } = require('../../../../db/db.js')
const { timestampForPostgres } = require('../../../lib/general.lib.js')

/**
 * Updates the status counts and determines the overall status for the provided events
 *
 * This service sets the `event.overall_status` based on the statuses of the associated notifications. The logic used to
 * determine the overall status is as follows.
 *
 * - If all the notifications have a status of cancelled, then set to `cancelled`
 * - If one notification has a status of returned, then set to `returned`
 * - If no notifications are returned, but one has a status of error, then set to `error`
 * - If no notifications are returned or errored, but one has a status of pending, then set to `pending`
 * - If no notifications are returned, errored, or pending, then set to `sent`
 *
 * The `event.status_counts` field is updated to provide a breakdown of the counts of each notification status.
 *
 * ```json
 * { "cancelled": 1, "error": 0, "pending": 1, "returned": 0, "sent": 1 }
 * ```
 *
 * This service also updates the legacy property `event.metadata.error` field. This will match `error` in
 * `status_counts` and we keep it updated to avoid breaking anything in the legacy code.
 *
 * ## Import notes
 *
 * This service will override any existing values in the fields `overall_status`, `status_counts` and the
 * `metadata.error` property.
 *
 * It only updates the error count for events whose `eventIds` are provided.
 *
 * ## Error Conditions
 *
 * A notification will have its status set to `error` because of an issue when sending it to Notify (the request timed
 * out or Notify reject it). Or, the notification was successfully sent, but when subsequently checking with Notify its
 * status, the response indicates a problem at Notify's end.
 *
 * > For more information about error statuses from Notify, refer to the
 * > {@link https://docs.notifications.service.gov.uk/rest-api.html | documentation}
 *
 * @param {string[]} eventIds - the UUIDs of the events to update
 */
async function go(eventIds) {
  const query = _query()
  const updatedAt = timestampForPostgres()

  await db.raw(query, [updatedAt, eventIds])
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
    status_counts = os.status_counts,
    updated_at = ?
  FROM (
    SELECT
      n.event_id,
      COUNT(*) FILTER (WHERE n.status = 'error') AS error_count,
      CASE
        WHEN COUNT(*) = COUNT(*) FILTER (WHERE n.status = 'cancelled') THEN 'cancelled'
        WHEN COUNT(*) FILTER (WHERE n.status = 'returned') > 0 THEN 'returned'
        WHEN COUNT(*) FILTER (WHERE n.status = 'error') > 0 THEN 'error'
        WHEN COUNT(*) FILTER (WHERE n.status = 'pending') > 0 THEN 'pending'
        ELSE 'sent'
      END AS overall_status,
      jsonb_build_object(
        'cancelled', COUNT(*) FILTER (WHERE n.status = 'cancelled'),
        'error', COUNT(*) FILTER (WHERE n.status = 'error'),
        'pending', COUNT(*) FILTER (WHERE n.status = 'pending'),
        'returned', COUNT(*) FILTER (WHERE n.status = 'returned'),
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
