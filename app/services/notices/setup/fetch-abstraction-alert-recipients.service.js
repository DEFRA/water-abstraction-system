'use strict'

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 * @module FetchAbstractionAlertRecipientsService
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
 * Recipients can come from three contact types:
 * - 'additional contact' - an email address
 * - 'primary user' - an email address
 * - 'licence holder' - a letter
 *
 * Each licence can have multiple additional contacts.
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
 * Because we are working with `licence_document_header` we get one row per licence. So, the next step is to group the
 * contacts by their contact information.
 *
 * We do this by generating a hash ID using PostgreSQL's
 * {@link https://www.postgresql.org/docs/current/functions-binarystring.html | md5() function}. For email contacts, we
 * simply hash the email address. For letter contacts, we extract key fields out of the JSON in `metadata`, convert them
 * to lowercase, concatenate them, and then generate an `md5()` result from it.
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
  WITH additional_contacts AS (
    SELECT
      DISTINCT
      ld.licence_ref,
      'Additional contact' AS contact_type,
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
  ),

  primary_users AS (
    SELECT
      ldh.licence_ref,
      'Primary user' AS contact_type,
      le.name AS email,
      NULL::jsonb AS contact,
      md5(LOWER(le.name)) AS contact_hash_id,
      ('Email') as message_type
    FROM
      public.licence_document_headers ldh
      INNER JOIN public.licence_entity_roles ler
        ON ler.company_entity_id = ldh.company_entity_id
        AND ler.role = 'primary_user'
      INNER JOIN public.licence_entities le
        ON le.id = ler.licence_entity_id
    WHERE
      ldh.licence_ref = ANY (?)
  ),

  licence_holders AS (
    SELECT
      ldh.licence_ref,
      'Licence holder' AS contact_type,
      NULL AS email,
      contacts AS contact,
      md5(LOWER(concat_ws(
        '',
        contacts ->> 'salutation',
        contacts ->> 'forename',
        contacts ->> 'initials',
        contacts ->> 'name',
        contacts ->> 'addressLine1',
        contacts ->> 'addressLine2',
        contacts ->> 'addressLine3',
        contacts ->> 'addressLine4',
        contacts ->> 'town',
        contacts ->> 'county',
        contacts ->> 'postcode',
        contacts ->> 'country'
      ))) AS contact_hash_id,
      ('Letter') as message_type
    FROM
      public.licence_document_headers ldh
      INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts
        ON TRUE
    WHERE
      ldh.licence_ref = ANY (?)
      AND contacts ->> 'role' = 'Licence holder'
  ),

  primary_or_licence_holder AS (
    SELECT
      licence_ref,
      contact_type,
      email,
      contact,
      contact_hash_id,
      message_type
    FROM primary_users
    UNION ALL
    SELECT
      lh.licence_ref,
      lh.contact_type,
      lh.email,
      lh.contact,
      lh.contact_hash_id,
      message_type
    FROM licence_holders lh
    WHERE NOT EXISTS (
      SELECT 1
      FROM primary_users pu
      WHERE pu.licence_ref = lh.licence_ref
    )
  ),

    all_contacts AS (
      SELECT * FROM additional_contacts
      UNION ALL
      SELECT * FROM primary_or_licence_holder
    ),

  unique_contact AS (
    SELECT DISTINCT ON (contact_hash_id)
      contact_hash_id,
      contact_type,
      email,
      contact,
      message_type
    FROM all_contacts
    ORDER BY contact_hash_id
  ),

  -- Aggregate all licence_refs per contact_hash_id
  aggregated_contact_data AS (
    SELECT
    contact_hash_id,
    JSON_AGG(DISTINCT licence_ref ORDER BY licence_ref) AS licence_refs
    FROM all_contacts
    GROUP BY contact_hash_id
  )

  SELECT
    a.licence_refs,
    uc.contact_type,
    uc.email,
    uc.contact,
    uc.contact_hash_id,
    uc.message_type
  FROM
    aggregated_contact_data a
      JOIN
    unique_contact uc
    USING (contact_hash_id)
  ORDER BY
    licence_refs::text;
`
}

module.exports = {
  go
}
