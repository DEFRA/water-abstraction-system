'use strict'

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 * @module FetchAbstractionAlertContactsService
 */

const { db } = require('../../../../db/db.js')

/**
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {Promise<object[]>} The contact data for all licence refs
 */
async function go(session) {
  const { rows } = await _fetch(session)
  return rows
}

async function _fetch(session) {
  const query = _query()

  const { licenceRefs } = session

  const bindings = [licenceRefs, licenceRefs, licenceRefs]

  return db.raw(query, bindings)
}

function _query() {
  return `
    SELECT string_agg(licence_ref, ',' ORDER BY licence_ref) AS licence_refs,
           contact_type,
           email,
           contact,
           contact_hash_id
    FROM (SELECT DISTINCT ldh.licence_ref,
                          (contacts ->> 'role') AS contact_type,
                          (NULL)                AS email,
                          contacts              as contact,
                          (md5(
                            LOWER(
                              concat(contacts ->> 'salutation', contacts ->> 'forename', contacts ->> 'initials',
                                     contacts ->> 'name', contacts ->> 'addressLine1', contacts ->> 'addressLine2',
                                     contacts ->> 'addressLine3', contacts ->> 'addressLine4', contacts ->> 'town',
                                     contacts ->> 'county', contacts ->> 'postcode', contacts ->> 'country')
                            )
                           ))                   AS contact_hash_id
          FROM public.licence_document_headers ldh
                 INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
          WHERE ldh.licence_ref = ANY (?)
            AND contacts ->> 'role' IN ('Licence holder')
            AND NOT EXISTS (SELECT 1
                            FROM public.licence_entity_roles ler
                            WHERE ler.company_entity_id = ldh.company_entity_id
                              AND ler."role" IN ('primary_user'))
          UNION ALL
          SELECT ldh.licence_ref,
                 ('Primary user')      AS contact_type,
                 le."name"             AS email,
                 (NULL)                AS contact,
                 md5(LOWER(le."name")) AS contact_hash_id
          FROM public.licence_document_headers ldh
                 INNER JOIN public.licence_entity_roles ler
                            ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'primary_user'
                 INNER JOIN public.licence_entities le
                            ON le.id = ler.licence_entity_id
          WHERE ldh.licence_ref = ANY (?)
          UNION ALL
          SELECT ldh.licence_ref,
                 ('Additional contact')   AS contact_type,
                 con.email             AS email,
                 (NULL)                AS contact,
                 md5(LOWER(con.email)) AS contact_hash_id
          FROM public.licence_document_headers ldh
                 INNER JOIN public.licence_documents ld
                            ON ld.licence_ref = ldh.licence_ref
                 INNER JOIN public.licence_document_roles AS ldr ON ldr.licence_document_id = ld.id
                 INNER JOIN public.company_contacts AS cct ON cct.company_id = ldr.company_id
                 INNER JOIN public.contacts AS con ON con.id = cct.contact_id
                 INNER JOIN public.licence_roles AS lr ON lr.id = cct.licence_role_id
          WHERE ldh.licence_ref = ANY (?)) contacts
    GROUP BY contact_type,
             email,
             contact,
             contact_hash_id;`
}

module.exports = {
  go
}
