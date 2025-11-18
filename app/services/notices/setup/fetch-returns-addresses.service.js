'use strict'

/**
 * Fetches the addresses to send a paper return invitations to.
 * @module FetchReturnsAddressesService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the addresses to send a paper return invitations to.
 *
 * The function returns the address for the licence holder.
 *
 * @param {string[]} returnIds - The return log ids whose licence holders need to be notified by post.
 *
 * @returns {Promise<object[]>} - an array of licence holder deteails for sending paper return invitations
 */
async function go(returnIds) {
  const { rows } = await _fetch(returnIds)

  return rows
}

async function _fetch(returnIds) {
  const bindings = [returnIds]

  const query = _query()

  return db.raw(query, bindings)
}

function _query() {
  return `
    WITH
      due_return_logs as (
        SELECT
          rl.licence_ref,
          rl.status,
          rl.metadata,
          rl.due_date,
          rl.return_id
        FROM public.return_logs rl
        WHERE
          rl.status = 'due'
          AND rl.metadata->>'isCurrent' = 'true'
          AND rl.return_id = ANY (?)
      ),

      licence_holder as (
        SELECT
          ldh.licence_ref,
          contacts as contact,
          ('Licence holder') AS contact_type,
          (md5(
            LOWER(
              concat(contacts->>'salutation', contacts->>'forename', contacts->>'initials', contacts->>'name', contacts->>'addressLine1', contacts->>'addressLine2', contacts->>'addressLine3', contacts->>'addressLine4', contacts->>'town', contacts->>'county', contacts->>'postcode', contacts->>'country')
            )
          )) AS contact_hash_id,
          rl.return_id
        FROM public.licence_document_headers ldh
          INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
          INNER JOIN due_return_logs rl
            ON rl.licence_ref = ldh.licence_ref
        WHERE
          contacts->>'role' = 'Licence holder'
      ),

      best_contact_type AS (
        SELECT DISTINCT ON (contact_hash_id)
          contact_hash_id,
          contact_type,
          contact
        FROM licence_holder
        ORDER BY contact_hash_id
      ),

      -- Aggregate per contact_hash_id
      aggregated_contact_data AS (
        SELECT
          contact_hash_id,
          JSON_AGG(DISTINCT licence_ref ORDER BY licence_ref) AS licence_refs,
          JSON_AGG(DISTINCT return_id ORDER BY return_id) AS return_ids
        FROM licence_holder
        GROUP BY contact_hash_id
      )

    SELECT
      a.licence_refs,
      b.contact,
      b.contact_type,
      a.return_ids as return_log_ids
    FROM
      aggregated_contact_data a
        JOIN
      best_contact_type b
      USING (contact_hash_id)
    ORDER BY
      b.contact NULLS LAST
`
}

module.exports = {
  go
}
