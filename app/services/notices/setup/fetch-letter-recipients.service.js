'use strict'

/**
 * Fetches the recipients data for the `/notices/setup/check` page
 * @module FetchLetterRecipientsService
 */

const { db } = require('../../../../db/db.js')

/**
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {Promise<object[]>} The contact data for all the outstanding return logs
 */
async function go(session) {
  const { licenceRef } = session
  const bindings = [licenceRef]

  const { rows } = await _fetch(bindings)

  return rows
}

async function _fetch(bindings) {
  const query = _query()

  return db.raw(query, bindings)
}

function _query() {
  return `
  WITH return_logs as (
      SELECT DISTINCT ON (rl.licence_ref)
        rl.licence_ref,
        rl.status,
        rl.metadata,
        rl.due_date
      FROM public.return_logs rl
      WHERE
        rl.status = 'due'
        AND rl.metadata->>'isCurrent' = 'true'
    )
  SELECT
  string_agg(licence_ref, ',' ORDER BY licence_ref) AS licence_refs,
  contact_type,
  email,
  contact,
  contact_hash_id
FROM (
  SELECT DISTINCT
    ldh.licence_ref,
    (contacts->>'role') AS contact_type,
    (NULL) AS email,
    contacts as contact,
    (md5(
      LOWER(
        concat(contacts->>'salutation', contacts->>'forename', contacts->>'initials', contacts->>'name', contacts->>'addressLine1', contacts->>'addressLine2', contacts->>'addressLine3', contacts->>'addressLine4', contacts->>'town', contacts->>'county', contacts->>'postcode', contacts->>'country')
      )
    )) AS contact_hash_id
  FROM public.licence_document_headers ldh
    INNER JOIN return_logs
        ON return_logs.licence_ref = ldh.licence_ref
    INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
  WHERE
    ldh.licence_ref = ?
    AND contacts->>'role' IN ('Licence holder', 'Returns to')
) contacts
GROUP BY
  contact_type,
  email,
  contact,
  contact_hash_id;`
}

module.exports = {
  go
}
