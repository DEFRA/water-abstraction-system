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
    WITH current_licence_contacts AS (
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
      WHERE
        (
          LEAST(l.expired_date, l.lapsed_date, l.revoked_date) IS NULL
          OR LEAST(l.expired_date, l.lapsed_date, l.revoked_date) > NOW()
        )
    ),
    relevant_roles AS (
      SELECT
        clc.*
      FROM current_licence_contacts clc
      WHERE
        clc.contact_role IN ('Licence holder', 'Returns to')
    ),
    no_country_postcode AS (
      SELECT
        rl.*
      FROM relevant_roles rl
      WHERE
        rl.country IS NULL
        AND rl.postcode IS NULL
    ),
    starts_with_invalid AS (
      SELECT
        rl.*
      FROM relevant_roles rl
      WHERE
        LEFT(address_line_1, 1) IN ('@', '(', ')', '=', '[', ']', '”', '\\', '/', ',', '<', '>')
        OR LEFT(address_line_2, 1) IN ('@', '(', ')', '=', '[', ']', '”', '\\', '/', ',', '<', '>')
        OR LEFT(address_line_3, 1) IN ('@', '(', ')', '=', '[', ']', '”', '\\', '/', ',', '<', '>')
        OR LEFT(address_line_4, 1) IN ('@', '(', ')', '=', '[', ']', '”', '\\', '/', ',', '<', '>')
        OR LEFT(town, 1) IN ('@', '(', ')', '=', '[', ']', '”', '\\', '/', ',', '<', '>')
        OR LEFT(county, 1) IN ('@', '(', ')', '=', '[', ']', '”', '\\', '/', ',', '<', '>')
        OR LEFT(postcode, 1) IN ('@', '(', ')', '=', '[', ']', '”', '\\', '/', ',', '<', '>')
        OR LEFT(country, 1) IN ('@', '(', ')', '=', '[', ']', '”', '\\', '/', ',', '<', '>')
    ),
    combined_results AS (
      SELECT * FROM no_country_postcode
      UNION ALL
      SELECT * FROM starts_with_invalid
    )
    SELECT
      cr.*
    FROM
      combined_results cr
    ORDER BY
      cr.licence_ref,
      cr.contact_role,
      cr.address_line_1;
  `)
}

module.exports = {
  go
}
