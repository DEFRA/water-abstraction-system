'use strict'

const { db } = require('../../../db/db.js')

async function go (licenceId) {
  const results = await _fetch(licenceId)

  return results.rows
}

async function _fetch (licenceId) {
  return db.raw(`
    SELECT
  *
FROM (
  SELECT
    l.id AS licence_id,
    'licence-version' AS entry_type,
    lv.id AS entry_id,
    lv.status::text AS reason,
    lv.created_at,
    '' AS created_by,
    '' AS note,
    lv.issue AS version_number
  FROM
    public.licences l
  INNER JOIN public.licence_versions lv ON lv.licence_id = l.id
  WHERE
    l.licence_ref = '01/117'
  UNION ALL
  SELECT
    l.id AS licence_id,
    'charge-version' AS entry_type,
    cv.id AS entry_id,
    cr.description AS reason,
    cv.created_at,
    cv.created_by->>'email' AS created_by,
    cvn."text" AS note,
    cv.version_number
  FROM
    public.licences l
  INNER JOIN public.charge_versions cv ON cv.licence_id = l.id
  INNER JOIN public.change_reasons cr ON cr.id = cv.change_reason_id
  LEFT JOIN water.notes cvn ON cvn.type_id = cv.id
  WHERE
    l.id = ?
  UNION ALL
  SELECT
    l.id AS licence_id,
    'return-version' AS entry_type,
    rv.id AS entry_id,
    rv.reason,
    rv.created_at,
    u.username AS created_by,
    rv.notes AS note,
    rv.VERSION AS version_number
  FROM
    public.licences l
  INNER JOIN public.return_versions rv ON rv.licence_id = l.id
  LEFT JOIN public.users u ON u.id = rv.created_by
  WHERE
    l.id = ?
) entries
ORDER BY entries.created_at DESC, entries.version_number DESC;`,
  [licenceId, licenceId])
}

module.exports = {
  go
}
