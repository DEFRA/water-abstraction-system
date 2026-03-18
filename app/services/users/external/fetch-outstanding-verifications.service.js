'use strict'

/**
 * Fetches outstanding verifications for an external user on the `/users/external/{id}` page
 * @module FetchOutstandingVerificationsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches outstanding verifications for an external user on the `/users/external/{id}` page
 *
 * @param {number} licenceEntityId - The licence entity ID of the requested user
 *
 * @returns {Promise<object[]>} the requested user verifications
 */
async function go(licenceEntityId) {
  const { rows } = await _fetch(licenceEntityId)

  return rows
}

async function _fetch(licenceEntityId) {
  const params = [licenceEntityId]
  const query = `
WITH latest_holders AS (
  SELECT DISTINCT ON (lv.licence_id)
    lv.licence_id,
    lvh.derived_name
  FROM
    public.licence_versions lv
  INNER JOIN public.licence_version_holders lvh
    ON lvh.licence_version_id = lv.id
  ORDER BY
    lv.licence_id,    -- DISTINCT ON requires the first ORDER BY to match
    lv.issue DESC,
    lv.increment DESC
)
SELECT
  uv.id,
  uv.verification_code AS "verificationCode",
  uv.created_at AS "createdAt",
  l.id AS "licenceId",
  l.licence_ref AS "licenceRef",
  lh.derived_name AS "licenceHolder"
FROM
  public.user_verifications uv
INNER JOIN public.user_verification_documents uvd
  ON uvd.user_verification_id = uv.id
INNER JOIN public.licence_document_headers ldh
  ON ldh.id = uvd.licence_document_header_id
INNER JOIN public.licences l
  ON l.licence_ref = ldh.licence_ref
INNER JOIN public.users u
  ON u.licence_entity_id = uv.licence_entity_id
LEFT JOIN latest_holders lh
  ON lh.licence_id = l.id
WHERE
  uv.licence_entity_id = ?
  AND uv.verified_at IS NULL
ORDER BY
  uv.created_at DESC,
  l.licence_ref ASC;
`

  return db.raw(query, params)
}

module.exports = {
  go
}
