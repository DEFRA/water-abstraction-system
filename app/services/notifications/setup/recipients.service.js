'use strict'

/**
 * Formats data for the `/notifications/setup/review` page
 * @module RecipientsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches recipient data for the `/notifications/setup/review` page
 *
 * @param {string} dueDate
 * @param {string} isSummer
 *
 * @param page
 * @returns {object} A list of recipients
 */
async function go(dueDate, isSummer, page = 1) {
  const { rows } = await _fetch('2024-11-28', 'true', page)
  const counter = await _count('2024-11-28', 'true')
  return {
    recipients: rows,
    total: counter.rows.length
  }
}

//  temp count
async function _count(dueDate, isSummer) {
  const query = _query()
  const limit = 100000000
  const offset = 1
  return db.raw(query, [dueDate, isSummer, dueDate, isSummer, dueDate, isSummer, limit, offset])
}

//  isSummer may need to be a string
async function _fetch(dueDate, isSummer, page) {
  const query = _query()
  const limit = 20
  const offset = 20 * Number(page)
  return db.raw(query, [dueDate, isSummer, dueDate, isSummer, dueDate, isSummer, limit, offset])
}

function _query() {
  return `SELECT
  string_agg(licence_ref, ',' ORDER BY licence_ref) AS all_licences,
  message_type,
  recipient,
  contact,
  contact_hash_id
FROM (
  SELECT DISTINCT
    ldh.licence_ref,
    (CASE
      WHEN contacts->>'role' = 'Licence holder' THEN 'Letter - licence holder'
      ELSE 'Letter - returns to'
    END) AS message_type,
    (NULL) AS recipient,
    contacts AS contact,
    (hashtext(
      LOWER(
        concat(contacts->>'salutation', contacts->>'forename', contacts->>'initials', contacts->>'name', contacts->>'addressLine1', contacts->>'addressLine2', contacts->>'addressLine3', contacts->>'addressLine4', contacts->>'town', contacts->>'county', contacts->>'postcode', contacts->>'country')
      )
    )) AS contact_hash_id
  FROM public.licence_document_headers ldh
  INNER JOIN public.return_logs rl
    ON rl.licence_ref = ldh.licence_ref
  INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
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
    ('Email - primary user') AS message_type,
    le."name" AS recipient,
    (NULL) AS contact,
    hashtext(LOWER(le."name")) AS contact_hash_id
  FROM public.licence_document_headers ldh
  INNER JOIN public.licence_entity_roles ler
    ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'primary_user'
  INNER JOIN public.licence_entities le
    ON le.id = ler.licence_entity_id
  INNER JOIN public.return_logs rl
    ON rl.licence_ref = ldh.licence_ref
  WHERE
    rl.status = 'due'
    AND rl.due_date = ?
    AND rl.metadata->>'isCurrent' = 'true'
    AND rl.metadata->>'isSummer' = ?
  UNION ALL
  SELECT
    ldh.licence_ref,
    ('Email - returns agent') AS message_type,
    le."name" AS recipient,
    (NULL) AS contact,
    hashtext(LOWER(le."name")) AS contact_hash_id
  FROM public.licence_document_headers ldh
  INNER JOIN public.licence_entity_roles ler
    ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'user_returns'
  INNER JOIN public.licence_entities le
    ON le.id = ler.licence_entity_id
  INNER JOIN public.return_logs rl
    ON rl.licence_ref = ldh.licence_ref
  WHERE
    rl.status = 'due'
    AND rl.due_date = ?
    AND rl.metadata->>'isCurrent' = 'true'
    AND rl.metadata->>'isSummer' = ?
) recipients
GROUP BY
  message_type,
  recipient,
  contact,
  contact_hash_id
ORDER BY all_licences
LIMIT ?
OFFSET ?;`
}

module.exports = {
  go
}
