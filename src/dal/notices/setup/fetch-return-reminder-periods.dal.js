const sql = `WITH
recent_return_cycles AS (
  SELECT
    rc.end_date,
    rc.id,
    rc.start_date,
    rc.summer
  FROM public.return_cycles rc
  WHERE rc.start_date > (
    date_trunc('year', CURRENT_DATE) - INTERVAL '3 years' + INTERVAL '3 months' - INTERVAL '1 day'
  )
),
reminded_return_logs AS (
  -- Flatten the JSONB arrays once, instead of running @> for every return log
  SELECT DISTINCT e.val #>> '{}' AS return_log_id
  FROM public.notifications n
  CROSS JOIN LATERAL jsonb_array_elements(n.return_log_ids) AS e(val)
  WHERE n.message_ref = 'returns reminder'
    AND n.status = 'sent'
    AND n.contact_type IN ('licence holder', 'primary user')
    AND n.return_log_ids IS NOT NULL
    AND jsonb_typeof(n.return_log_ids) = 'array'
    AND jsonb_typeof(e.val) = 'string'   -- same semantics as @> with a varchar[] array
)
SELECT rrc.*
FROM recent_return_cycles rrc
WHERE EXISTS (
  SELECT 1
  FROM public.return_logs rl
  WHERE rl.return_cycle_id = rrc.id
    AND rl.status = 'due'
    AND rl.due_date IS NOT NULL
    AND rl.end_date < CURRENT_DATE
    AND rl.start_date > (
      date_trunc('year', CURRENT_DATE) - INTERVAL '3 years' + INTERVAL '3 months' - INTERVAL '1 day'
    )
    AND NOT EXISTS (
      SELECT 1
      FROM reminded_return_logs r
      WHERE r.return_log_id = rl.id::text
    )
)
ORDER BY rrc.end_date DESC;`
