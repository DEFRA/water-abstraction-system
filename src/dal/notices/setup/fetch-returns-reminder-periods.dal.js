/**
 * Fetches return cycles with 'due' returns that have a due date and have not been sent a returns reminder
 * @module FetchReturnReminderPeriods
 */

import { db } from 'water-abstraction-engine/db/db.js'

/**
 * Fetches return cycles with 'due' returns that have a due date and have not been sent a returns reminder
 *
 * A return is a candidate for a reminder if it is 'due' and has a due date. This indicates that the return invitation
 * has been sent successfully.
 *
 * But it's then on the user to submit the return in order to change this state. That means returns could stay like
 * this in perpetuity.
 *
 * The intent of the notice journey is to only show periods with outstanding return reminders. So, we also cross check
 * the notifications to see if the return log's ID is present. If it isn't, then a return reminder is needed, and we
 * return the related return cycle.
 *
 * Because we're cross checking one massive table with another, we have had to switch to raw SQL to make the query as
 * performant as possible. It also depends on the index added in
 * {@link https://github.com/DEFRA/water-abstraction-returns/pull/519}.
 *
 * @returns {Promise<object[]>} return cycles with 'due' returns that have yet to receive a reminder
 */
export default async function fetchReturnReminderPeriods() {
  const sql = `WITH
recent_return_cycles AS (
  SELECT
    rc.end_date,
    rc.id,
    rc.start_date,
    rc.summer
  FROM
    public.return_cycles rc
  WHERE
    rc.start_date >= (CURRENT_DATE - INTERVAL '3 years')
),
reminded_return_logs AS (
  -- Flatten the JSONB arrays once, instead of running @> for every return log
  SELECT DISTINCT
    e.val #>> '{}' AS return_log_id
  FROM
    public.notifications n
  CROSS JOIN LATERAL jsonb_array_elements(n.return_log_ids) AS e(val)
  WHERE
    n.message_ref = 'returns reminder'
    AND n.status = 'sent'
    AND n.contact_type IN ('licence holder', 'primary user')
    AND n.return_log_ids IS NOT NULL
    AND jsonb_typeof(n.return_log_ids) = 'array'
    AND jsonb_typeof(e.val) = 'string'   -- same semantics as @> with a varchar[] array
)
SELECT
  rrc.end_date AS "endDate",
  rrc.id,
  rrc.start_date AS "startDate",
  rrc.summer
FROM
  recent_return_cycles rrc
WHERE EXISTS (
  SELECT
    1
  FROM
    public.return_logs rl
  WHERE
    rl.return_cycle_id = rrc.id
    AND rl.status = 'due'
    AND rl.due_date IS NOT NULL
    AND rl.end_date < CURRENT_DATE
    AND rl.start_date > (CURRENT_DATE - INTERVAL '3 years')
    AND NOT EXISTS (
      SELECT
        1
      FROM
        reminded_return_logs r
      WHERE
        r.return_log_id = rl.id::text
    )
)
ORDER BY
  rrc.end_date DESC;
`
  const { rows } = await db.raw(sql)

  return rows
}
