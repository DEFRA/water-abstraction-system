'use strict'

/**
 * Generates the SQL query for abstraction alert additional contact
 * @module GenerateAbstractionAlertAdditionalContactQueryDal
 */

/**
 * Generates the SQL query for abstraction alert additional contacts
 *
 * @param {string[]} licenceRefs - The licence refs to fetch additional contacts for
 *
 * @returns {object} The query and bindings for the additional contacts query
 */
function go(licenceRefs) {
  return {
    bindings: [licenceRefs],
    query: _query()
  }
}

function _query() {
  return `
    SELECT
      DISTINCT
      ld.licence_ref,
      'additional contact' AS contact_type,
      con.email,
      NULL::jsonb AS contact,
      md5(LOWER(con.email)) AS contact_hash_id,
      ('Email') as message_type
    FROM
      public.licence_documents ld
        INNER JOIN public.licence_document_roles ldr
          ON ldr.licence_document_id = ld.id
        INNER JOIN public.company_contacts cct
          ON cct.company_id = ldr.company_id
        INNER JOIN public.contacts con
          ON con.id = cct.contact_id
        INNER JOIN public.licence_roles lr
          ON lr.id = cct.licence_role_id
    WHERE
      ld.licence_ref = ANY (?)
      AND (
      ldr.end_date IS NULL
        OR ldr.end_date >= CURRENT_DATE
      )
      AND cct.abstraction_alerts = true
      AND cct.deleted_at IS NULL
  `
}

module.exports = {
  go
}
