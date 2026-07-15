/**
 * Fetches recipient data for an alternate renewal notice
 * @module FetchAlternateRenewalRecipientsService
 */

import { db } from '../../../../../db/db.js'
import { licenceHolderRecipientQuery } from '../../../../dal/notices/recipient-queries.dal.js'

/**
 * Fetches recipient data for an alternate renewal notice
 *
 * Fetches the licence holder contacts for the specific licence refs taken from failed renewal invitation emails to
 * primary users. These contacts will receive letters as a fallback for the failed emails.
 *
 * @param {string[]} licenceRefs - The licence references extracted from failed renewal invitation emails
 *
 * @returns {Promise<object[]>} The recipient data for the alternate renewal notice
 */
export default async function fetchAlternateRenewalRecipientsService(licenceRefs) {
  const { rows } = await db.raw(_query(), [licenceRefs])

  return rows
}

function _query() {
  return `
    WITH
      licence_holders AS (
        ${licenceHolderRecipientQuery}
        WHERE l.licence_ref = ANY (?)
      ),
      aggregated_contact_data AS (
        SELECT
          contact_hash_id,
          JSONB_AGG(DISTINCT licence_ref ORDER BY licence_ref) AS licence_refs
        FROM licence_holders
        GROUP BY contact_hash_id
      ),
      results AS (
        SELECT DISTINCT ON (lh.contact_hash_id)
          lh.contact,
          lh.contact_hash_id,
          lh.contact_type,
          lh.email,
          acd.licence_refs,
          lh.message_type
        FROM licence_holders lh
        INNER JOIN aggregated_contact_data acd ON acd.contact_hash_id = lh.contact_hash_id
        ORDER BY lh.contact_hash_id
      )
    SELECT * FROM results;
  `
}
