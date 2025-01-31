'use strict'

/**
 * @module FetchDownloadRecipientsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetch all the contacts
 *
 * @param {Date} dueDate
 * @param {boolean} summer
 *
 * @returns {object[]} - matching recipients
 */
async function go(dueDate, summer) {
  const { rows } = await _fetch(dueDate, summer)

  return rows
}

async function _fetch(dueDate, summer) {
  const query = _query()

  return db.raw(query, [dueDate, summer, dueDate, summer])
}

function _query() {
  return `
SELECT
  contacts.licence_ref,
  contacts.contact_type,
  contacts.email,
  contacts.contact
FROM (
  SELECT DISTINCT
    ldh.licence_ref,
    (contacts->>'role') AS contact_type,
    (NULL) AS email,
    contacts as contact
  FROM public.licence_document_headers ldh
    INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON TRUE
    INNER JOIN public.return_logs rl
        ON rl.licence_ref = ldh.licence_ref
    WHERE
      rl.status = 'due'
      AND rl.due_date = ?
      AND rl.metadata->>'isCurrent' = 'true'
      AND rl.metadata->>'isSummer' = ?
      AND contacts->>'role' IN ('Licence holder', 'Returns to')
      AND NOT EXISTS (
        SELECT
            1
        FROM public.licence_entity_roles ler
        WHERE
          ler.company_entity_id = ldh.company_entity_id
        AND ler."role" IN ('primary_user', 'user_returns')
      )
  UNION ALL
  SELECT
    ldh.licence_ref,
    (CASE
      WHEN ler."role" = 'primary_user' THEN 'Primary user'
      ELSE 'Returns agent'
    END) AS contact_type,
    le."name" AS email,
    (NULL) AS contact
  FROM public.licence_document_headers ldh
  INNER JOIN public.licence_entity_roles ler
    ON ler.company_entity_id = ldh.company_entity_id
    AND ler."role" IN ('primary_user', 'user_returns')
  INNER JOIN public.licence_entities le
    ON le.id = ler.licence_entity_id
  INNER JOIN public.return_logs rl
    ON rl.licence_ref = ldh.licence_ref
  WHERE
    rl.status = 'due'
    AND rl.due_date = ?
    AND rl.metadata->>'isCurrent' = 'true'
    AND rl.metadata->>'isSummer' = ?
) contacts
ORDER BY
contacts.licence_ref`
}

module.exports = {
  go
}
