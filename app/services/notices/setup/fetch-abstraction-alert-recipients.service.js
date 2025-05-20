'use strict'

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 * @module FetchAbstractionAlertContactsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 *
 * > IMPORTANT! The source for notification contacts is `crm.document_headers` (view `licence_document_headers`), not
 * > the tables in `crm_v2`. However, the 'Additional contact' information is stored in `crm_v2`.
 *
 * Our overall goal is that a 'recipient' receives only one notification, irrespective of how many licences they are
 * linked to, or what roles they have.
 *
 * We will receive an array of licence refs in the session for our query. Theses are used to get the recipients.
 *
 * For each licence, we extract the contact information, if a licence is _registered_ (more details below), we only care
 * about the email addresses registered against it, all licences should have a 'licence holder' contact to fall back on.
 *
 * WRLS has the concept of a registered and unregistered licences:
 *
 * - **Unregistered licences** have not been linked to an external email, so do not have a 'primary user'. All licences
 * have a contact with the role 'Licence holder', so this will be extracted as a 'contact'.
 *
 * - **Registered licences** have been linked to an external email. That initial email will be linked as the 'primary
 * user'.
 *
 * If a licence is registered, we only extract the email contacts. Unregistered licences it's the 'Licence holder'
 * contact from `licence_document_headers.metadata->contacts`.
 *
 * When the licence is registered we can expect an 'additional contact'. This can be created a user and is stored in
 * `crm_v2`. As the 'primary user' is in `crm.document_headers` and the 'additional contact' stored in `crm_v2.document`
 * we need to accommodate this by linking the two 'copies' of the licence together, we do this by the licence ref.
 *
 * Because we are working with `licence_document_header` we get one row per licence. So, the next step is to group the
 * contacts by their contact information.
 *
 * We do this by generating a hash ID using PostgreSQL's
 * {@link https://www.postgresql.org/docs/current/functions-binarystring.html | md5() function}. For email contacts, we
 * simply hash the email address. For letter contacts, we extract key fields out of the JSON in `metadata`, convert them
 * to lowercase, concatenate them, and then generate an `md5()` result from it.
 *
 * This means we can identify 'duplicate' contacts. For example, we can determine these contact records will result in
 * the same 'recipient'.
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
    SELECT string_agg(
             licence_ref,
             ','
             ORDER BY
               licence_ref
           ) AS licence_refs,
           contact_type,
           email,
           contact,
           contact_hash_id
    FROM (SELECT DISTINCT ldh.licence_ref,
                          (contacts ->> 'role') AS contact_type,
                          (NULL)                AS email,
                          contacts              as contact,
                          (
                            md5(
                              LOWER(
                                concat(
                                  contacts ->> 'salutation', contacts ->> 'forename',
                                  contacts ->> 'initials', contacts ->> 'name',
                                  contacts ->> 'addressLine1', contacts ->> 'addressLine2',
                                  contacts ->> 'addressLine3', contacts ->> 'addressLine4',
                                  contacts ->> 'town', contacts ->> 'county',
                                  contacts ->> 'postcode', contacts ->> 'country'
                                )
                              )
                            )
                            )                 AS contact_hash_id
          FROM public.licence_document_headers ldh
                 INNER JOIN return_logs ON return_logs.licence_ref = ldh.licence_ref
                 INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
          WHERE ldh.licence_ref = ANY (?)
            AND contacts ->> 'role' IN ('Licence holder')
            AND NOT EXISTS (SELECT 1
                            FROM public.licence_entity_roles ler
                            WHERE ler.company_entity_id = ldh.company_entity_id
                              AND ler."role" IN ('primary_user'))
          UNION ALL
          SELECT ldh.licence_ref,
                 ('Primary user') AS contact_type,
                 le."name"        AS email,
                 (NULL)           AS contact,
                 md5(
                   LOWER(le."name")
                 )                AS contact_hash_id
          FROM public.licence_document_headers ldh
                 INNER JOIN public.licence_entity_roles ler ON ler.company_entity_id = ldh.company_entity_id
            AND ler."role" = 'primary_user'
                 INNER JOIN public.licence_entities le ON le.id = ler.licence_entity_id
          WHERE ldh.licence_ref = ANY (?)
          UNION ALL
          SELECT ldh.licence_ref,
                 ('Additional contact') AS contact_type,
                 con.email              AS email,
                 (NULL)                 AS contact,
                 md5(
                   LOWER(con.email)
                 )                      AS contact_hash_id
          FROM public.licence_document_headers ldh
                 INNER JOIN public.licence_documents ld ON ld.licence_ref = ldh.licence_ref
                 INNER JOIN public.licence_document_roles AS ldr ON ldr.licence_document_id = ld.id
                 INNER JOIN public.company_contacts AS cct ON cct.company_id = ldr.company_id
                 INNER JOIN public.contacts AS con ON con.id = cct.contact_id
                 INNER JOIN public.licence_roles AS lr ON lr.id = cct.licence_role_id
          WHERE ldh.licence_ref = ANY (?)) contacts
    GROUP BY contact_type,
             email,
             contact,
             contact_hash_id;

  `
}

module.exports = {
  go
}
