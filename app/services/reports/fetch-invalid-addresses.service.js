'use strict'

/**
 * Fetches invalid addresses linked to 'Licence holder' and 'Returns to' contacts for non-ended licences
 * @module FetchInvalidAddressesService
 */

const { db } = require('../../../db/db.js')

/**
 * Fetches invalid addresses linked to 'Licence holder' and 'Returns to' contacts for non-ended licences
 *
 * @returns {Promise<object[]>} the matching addresses that are missing their postcodes and countries
 * and licence data
 */
async function go() {
  const data = await _fetch()

  return data.rows
}

async function _fetch() {
  return db.raw(`
    WITH lhc AS (
      SELECT DISTINCT
        dh.system_external_id AS licence_ref,
        (LEAST(l.expired_date, l.lapsed_date, l.revoked_date)) AS licence_ends,
        (contacts->>'role') AS contact_role,
        (contacts->>'addressLine1') AS address_line_1,
        (contacts->>'addressLine2') AS address_line_2,
        (contacts->>'addressLine3') AS address_line_3,
        (contacts->>'addressLine4') AS address_line_4,
        (contacts->>'town') AS town,
        (contacts->>'county') AS county,
        (contacts->>'postcode') AS postcode,
        (contacts->>'country') AS country
      FROM crm.document_header dh
      INNER JOIN LATERAL jsonb_array_elements(dh.metadata -> 'contacts') AS contacts ON TRUE
      INNER JOIN water.licences l
        ON l.licence_ref = dh.system_external_id
    )
    SELECT * FROM lhc WHERE
      lhc.contact_role IN ('Licence holder', 'Returns to')
      AND lhc.country IS NULL
      AND lhc.postcode IS NULL
      AND (lhc.licence_ends IS NULL OR lhc.licence_ends > NOW())
    ORDER BY lhc.licence_ref, lhc.contact_role, lhc.address_line_1;
  `)
}

module.exports = {
  go
}
