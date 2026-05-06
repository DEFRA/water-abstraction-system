'use strict'

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
 * @module FetchAbstractionAlertRecipientsService
 */

const { db } = require('../../../../../db/db.js')

/**
 * Fetches the abstraction alert recipients data for the `/notices/setup/check` page
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
 * If a licence is registered, we only extract the email contacts. For unregistered licences the 'Licence holder'
 * contact is fetched from `licence_versions`, joined to the `companies` and `addresses` tables.
 *
 * We do this by generating a hash ID using PostgreSQL's
 * {@link https://www.postgresql.org/docs/current/functions-binarystring.html | md5() function}. For email contacts, we
 * simply hash the email address. For letter contacts, we concatenate the key fields from the `companies` and
 * `addresses` tables, convert them to lowercase, and then generate an `md5()` result from it.
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
  const licenceHolderQuery = _licenceHolderQuery()

  return `
  WITH additional_contacts AS (
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
  ),

  primary_users AS (
    SELECT
      ldh.licence_ref,
      'primary user' AS contact_type,
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

  -- Which licences are registered (have a primary user). This CTE is used in the next CTE to filter out
  -- records linked to licences that are registered.
  registered_licences AS (
    SELECT DISTINCT licence_ref FROM primary_users
  ),

  licence_holders as (
    ${licenceHolderQuery}
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

function _licenceHolderQuery() {
  return `
    SELECT
      ('licence holder') AS contact_type,
      jsonb_build_object(
        'name', c.name,
        'address1', a.address_1,
        'address2', a.address_2,
        'address3', a.address_3,
        'address4', a.address_4,
        'address5', a.address_5,
        'address6', a.address_6,
        'postcode', a.postcode,
        'country', a.country
      ) AS contact,
      MD5(LOWER(CONCAT(
        c.name,
        a.address_1,
        a.address_2,
        a.address_3,
        a.address_4,
        a.address_5,
        a.address_6,
        a.postcode,
        a.country
      ))) AS contact_hash_id,
      NULL::TEXT AS email,
      l.licence_ref,
      ('Letter') AS message_type
    FROM
      public.licences l
    INNER JOIN (
      SELECT DISTINCT ON (lv.licence_id)
        lv.licence_id,
        lv.company_id,
        lv.address_id
      FROM
        public.licence_versions lv
      WHERE
        lv.start_date <= CURRENT_DATE
      ORDER BY
        lv.licence_id ASC,
        lv."issue" DESC,
        lv."increment" DESC,
        lv.end_date DESC NULLS FIRST
    ) AS llv ON llv.licence_id = l.id
    INNER JOIN public.companies c ON c.id = llv.company_id
    INNER JOIN public.addresses a ON a.id = llv.address_id
    LEFT JOIN registered_licences rl
    ON rl.licence_ref = l.licence_ref
    WHERE rl.licence_ref IS NULL
    AND l.licence_ref = ANY (?)
  `
}

module.exports = {
  go
}
