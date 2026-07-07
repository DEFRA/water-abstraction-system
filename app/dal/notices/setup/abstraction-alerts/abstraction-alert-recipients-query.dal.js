import {
  additionalContactRecipientQuery,
  licenceHolderRecipientQuery,
  primaryUserRecipientQuery
} from '../../recipient-queries.dal.js'

/**
 * Generates the SQL query for abstraction alert recipients
 *
 * Our overall goal is that a 'recipient' receives only one notification, irrespective of how many licences they are
 * linked to, or what roles they have.
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
 */
const abstractionAlertRecipientsQuery = `
  WITH additional_contacts AS (
    ${additionalContactRecipientQuery}
  ),

  primary_users AS (
    ${primaryUserRecipientQuery}
    WHERE ldh.licence_ref = ANY (?)
  ),

  -- Which licences are registered (have a primary user). This CTE is used in the next CTE to filter out
  -- records linked to licences that are registered.
  registered_licences AS (
    SELECT DISTINCT licence_ref FROM primary_users
  ),

  licence_holders as (
    ${licenceHolderRecipientQuery}
    LEFT JOIN registered_licences rl
      ON rl.licence_ref = l.licence_ref
    WHERE rl.licence_ref IS NULL
      AND l.licence_ref = ANY (?)
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
      lh.message_type
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

export default {
  abstractionAlertRecipientsQuery
}
