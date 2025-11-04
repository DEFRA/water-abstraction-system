'use strict'

/**
 * Fetches the addresses to send a paper return invitations to.
 * @module FetchReturnsAddressesService
 */

const { db } = require('../../../db/db.js')

const featureFlagsConfig = require('../../../config/feature-flags.config.js')

/**
 * Fetches the addresses to send a paper return invitations to.
 *
 * The function returns the address for the licence holder.
 *
 * @param {string[]} licenceRefs - The licence id to retrieve the address from.
 * @param {string} returnPeriod - The return period details.
 *
 * @returns {Promise<object[]>} - an array of licence references and their addresses
 */
async function go(licenceRefs, returnPeriod) {
  const { rows } = await _fetch(licenceRefs, returnPeriod)

  return rows
}

async function _fetch(licenceRefs, returnPeriod) {
  const { endDate, startDate, summer, quarterly, dueDate } = returnPeriod

  const where = `
    AND rl.due_date ${featureFlagsConfig.enableNullDueDate ? 'IS NULL' : '= ?'}
    AND rl.end_date <= ?
    AND rl.start_date >= ?
    AND rl.metadata->>'isSummer' = ?
    AND rl.quarterly = ?
  `
  const bindings = [endDate, startDate, summer, quarterly, licenceRefs]

  if (!featureFlagsConfig.enableNullDueDate) {
    bindings.unshift(dueDate)
  }

  const query = _query(where)

  return db.raw(query, bindings)
}

function _query(whereReturnLogs) {
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
          ${whereReturnLogs}
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
          ldh.licence_ref = ANY (?)
          AND contacts->>'role' = 'Licence holder'
      ),

      -- Aggregate per contact_hash_id
      aggregated_contact_data AS (
        SELECT
          contact_hash_id,
          string_agg(DISTINCT licence_ref, ',' ORDER BY licence_ref) AS licence_refs,
          JSON_AGG(DISTINCT return_id ORDER BY return_id) AS return_ids
        FROM licence_holder
        GROUP BY contact_hash_id
      )

    SELECT
      a.licence_refs,
      lh.contact,
      lh.contact_type,
      a.return_ids as return_log_ids
    FROM
      aggregated_contact_data a
        JOIN
      licence_holder lh
      USING (contact_hash_id)
    ORDER BY
      lh.contact NULLS LAST
`
}

module.exports = {
  go
}
