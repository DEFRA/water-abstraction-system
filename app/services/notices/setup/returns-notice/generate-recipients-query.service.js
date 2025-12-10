'use strict'

/**
 * Generates the SQL query for selecting recipients to fetch for a returns notice
 * @module GenerateRecipientsQueryService
 */

const { NoticeType } = require('../../../../lib/static-lookups.lib.js')

/**
 * Generates the SQL query for selecting recipients to fetch for a returns notice
 *
 * > IMPORTANT! The source for returns recipients is `licence_document_headers` (legacy table `crm.document_headers`),
 * > not the tables in `crm_v2`.
 *
 * The function creates a complex CTE (Common Table Expression) query that:
 *
 * - Uses the provided 'due return log' query as a base
 * - Identifies primary users, returns agents, licence holders, and returns-to contacts
 * - Prioritizes contacts (primary user > returns agent > licence holder > returns to)
 * - Selects the best contact for each unique contact hash ID
 * - Applies aggregation and result formatting based on download parameter
 *
 * Not all recipients are needed for all notice types. For example, paper returns can only be sent to 'Letter' based
 * recipients, and an alternate notice must only be sent to licence holders. Where this is the case the service
 * uses a 'no recipients' query, that won't break subsequent stages, but will ensure no results for that recipient type
 * is returned.
 *
 * When the query is being used to populate the download, aggregation is skipped. This is because our users wanted
 * to see all individual return log records rather than just the aggregated recipients. This also means the final
 * `SELECT` has to change to include the extra fields.
 *
 * The alternate to this service was a service per notice type, but this would have led to a lot of duplication as the
 * majority of the query is the same for all notice types.
 *
 * ## Recipient data
 *
 * ### Filtered by 'due' return logs
 *
 * The recipients are determined by which 'due' return logs we are fetching, defined by the `dueReturnLogQuery`
 * parameter. For example, a standard returns invitation notice will fetch 'due' return logs with a null due date for a
 * selected period. On the overhand, for a paper return notice the user will select the 'due' return logs to fetch.
 *
 * ### Recipient types
 *
 * We then link the fetched return logs by licence reference to the contact information we base the recipient data on.
 *
 * This is complicated by a number of factors.
 *
 * - If a licence is _registered_ (more details below), we only care about the email addresses registered against it
 * - All licences should have a 'licence holder' contact, but they may also have one or more 'returns' contacts
 * - There is a one-to-one relationship between `licences` and `licence_document_headers`, but the same contact can
 * appear on different licences
 *
 * WRLS has the concept of a registered and unregistered licences:
 *
 * - **Unregistered licences** have not been linked to an external email, so do not have a 'primary user'. All licences
 * have a contact with the role 'Licence holder', so this will be extracted as a 'contact'. They may also have one or
 * more contacts with the role 'Returns to', which is extracted as well. Because they do not have an email, these
 * recipients will be sent letters.
 * - **Registered licences** have been linked to an external email. That initial email will be linked as the 'primary
 * user'. These licences may also have designated other email accounts as 'returns agents', which will be extracted as
 * well. Because these licences have email addresses, notifications will be sent as emails.
 *
 * Where a notice type considers all contact types, we prioritise the 'email' based contacts over the 'letter' based
 * contacts. This is because email is the preferred notification method.
 *
 * ### One notification per recipient
 *
 * Our overall goal is that a 'recipient' receives only one notification, irrespective of how many licences they are
 * linked to, or what roles they have.
 *
 * However, `licence_document_header` store their contacts in a JSONB field, instead of linking to a separate contacts
 * table. We attempt to work around this by generating a hash ID using PostgreSQL's
 * {@link https://www.postgresql.org/docs/current/functions-binarystring.html | md5() function}for each contact found.
 *
 * For email contacts, we simply hash the email address. For letter contacts, we extract key fields out of the JSON in
 * `metadata`, convert them to lowercase, concatenate them, and then generate an `md5()` result from it.
 *
 * > The deduping is very basic. We don't account for Ltd vs Limited, FAO Jon vs Jon, etc. But just doing this reduces
 * > the number of recipients receiving duplicate notifications considerably compared to the legacy notification engine.
 *
 * ### Other data
 *
 * The key information we need from the results is which recipients we're sending the notice to. If the fetch is being
 * used to populate the notice's download file, we include details about the return logs the notice is based on. This is
 * used to verify the right licences are included, and none have been missed.
 *
 * When it comes to sending the notice we also need to include additional information. These are the licence refs and
 * the return log IDs.
 *
 * They populate fields in the notification record that then support other functionality.
 *
 * - `licence_refs` is how we we determine which communications to show when viewing a licence
 * - `return_log_ids` is how we track which return logs have had notifications sent against them, and which ones to
 * update when, for example, a returns invitation is confirmed as sent by Notify.
 *
 * @param {string} noticeType - The type of notice being generated (affects which contact-type queries are used)
 * @param {string} dueReturnLogsQuery - SQL query string that defines the base set of due return logs
 * @param {boolean} download - Flag indicating if this is for download purposes (affects aggregation and result
 * formatting)
 *
 * @returns {string} Complete SQL query for fetching the recipients for a notice or its download
 */
function go(noticeType, dueReturnLogsQuery, download) {
  const primaryUserQuery = _primaryUserQuery(noticeType)
  const returnsAgentQuery = _returnsAgentQuery(noticeType)
  const licenceHolderQuery = _licenceHolderQuery()
  const returnsToQuery = _returnsToQuery(noticeType)

  const processQuery = download ? _processForDownloading() : _processForSending()

  return `
WITH
  due_return_logs as (
    ${dueReturnLogsQuery}
  ),

  ldh_all AS (
    SELECT
      ldh.company_entity_id,
      ldh.licence_ref,
      ldh.metadata,
      drl.return_id,
      drl.return_reference,
      drl.start_date,
      drl.end_date,
      drl.due_date
    FROM public.licence_document_headers ldh
    JOIN due_return_logs drl
      ON drl.licence_ref = ldh.licence_ref
  ),

  primary_user as (
    ${primaryUserQuery}
  ),

  returns_agent as (
    ${returnsAgentQuery}
  ),

  -- set of licences that are registered (have a primary user)
  registered_licences AS (
    SELECT DISTINCT licence_ref FROM primary_user
  ),

  json_contacts AS (
    SELECT
      contacts,
      a.*
    FROM ldh_all a
    CROSS JOIN LATERAL jsonb_array_elements(a.metadata->'contacts') AS contacts
  ),

  licence_holder as (
    ${licenceHolderQuery}
  ),

  returns_to as (
    ${returnsToQuery}
  ),

  all_contacts AS (
    SELECT * FROM primary_user
    UNION ALL
    SELECT * FROM returns_agent
    UNION ALL
    SELECT * FROM licence_holder
    UNION ALL
    SELECT * FROM returns_to
  ),

  ${processQuery}

SELECT * FROM results;
  `
}

function _licenceHolderQuery() {
  return `
    SELECT
      contacts AS contact,
      (md5(
        LOWER(
          concat(
            contacts->>'salutation',
            contacts->>'forename',
            contacts->>'initials',
            contacts->>'name',
            contacts->>'addressLine1',
            contacts->>'addressLine2',
            contacts->>'addressLine3',
            contacts->>'addressLine4',
            contacts->>'town',
            contacts->>'county',
            contacts->>'postcode',
            contacts->>'country'
          )
        )
      )) AS contact_hash_id,
      ('licence holder') AS contact_type,
      a.due_date AS due_date,
      a.end_date AS end_date,
      (NULL) AS email,
      a.licence_ref,
      ('Letter') as message_type,
      a.return_id,
      a.return_reference AS return_reference,
      a.start_date AS start_date,
      3 AS priority
    FROM
      json_contacts a
    LEFT JOIN registered_licences rl ON
      rl.licence_ref = a.licence_ref
    WHERE
      contacts->>'role' = 'Licence holder'
      AND rl.licence_ref IS NULL
  `
}

function _primaryUserQuery(noticeType) {
  if (noticeType === NoticeType.INVITATIONS || noticeType === NoticeType.REMINDERS) {
    return `
    SELECT
      NULL::jsonb AS contact,
      md5(LOWER(le."name")) AS contact_hash_id,
      ('primary user') AS contact_type,
      a.due_date AS due_date,
      a.end_date AS end_date,
      le."name" AS email,
      a.licence_ref,
      ('Email') as message_type,
      a.return_id,
      a.return_reference AS return_reference,
      a.start_date AS start_date,
      1 AS priority
    FROM
      ldh_all a
    INNER JOIN public.licence_entity_roles ler
      ON ler.company_entity_id = a.company_entity_id AND ler."role" = 'primary_user'
    INNER JOIN public.licence_entities le
      ON le.id = ler.licence_entity_id
    `
  }

  return _noRecipientsQuery()
}

function _processForDownloading() {
  return `
  -- PROCESS FOR DOWNLOADING NOTICES

  -- Where a contact is duplicated, for example, licence holder and returns to are the same
  -- it selects the one with the highest priority and joins it to the due returns log data
  results AS (
    SELECT DISTINCT ON (licence_ref, return_reference, contact_hash_id)
      ac.contact,
      ac.contact_hash_id,
      ac.contact_type,
      ac.due_date,
      ac.end_date,
      ac.email,
      ac.licence_ref,
      ac.message_type,
      ac.return_reference,
      ac.start_date
    FROM
      all_contacts ac
    ORDER BY
      licence_ref,
      return_reference,
      contact_hash_id,
      priority
  )
  `
}

function _processForSending() {
  return `
  -- PROCESS FOR SENDING NOTICES

  -- Aggregate all licence_refs and return_ids per contact_hash_id
  aggregated_contact_data AS (
    SELECT
      contact_hash_id,
      JSON_AGG(DISTINCT licence_ref ORDER BY licence_ref) AS licence_refs,
      JSON_AGG(DISTINCT return_id ORDER BY return_id) AS return_ids
    FROM all_contacts
    GROUP BY contact_hash_id
  ),

  -- Where a contact is duplicated, for example, licence holder and returns to are the same,
  -- it selects the one with the highest priority and joins it to the aggreated data
  results AS (
    SELECT DISTINCT ON (contact_hash_id)
      ac.contact,
      ac.contact_hash_id,
      ac.contact_type,
      ac.email,
      acd.licence_refs,
      ac.message_type,
      acd.return_ids AS return_log_ids
    FROM
      all_contacts ac
    INNER JOIN aggregated_contact_data acd
      ON acd.contact_hash_id = ac.contact_hash_id
    ORDER BY
      contact_hash_id,
      priority
  )
  `
}

function _noRecipientsQuery() {
  return `
    SELECT
      NULL::jsonb AS contact,
      NULL AS contact_hash_id,
      ('no recipient') AS contact_type,
      NULL::date AS due_date,
      NULL::date AS end_date,
      NULL::text AS email,
      NULL::text AS licence_ref,
      ('none') as message_type,
      NULL::uuid AS return_id,
      NULL::text AS return_reference,
      NULL::date AS start_date,
      999 AS priority
    WHERE FALSE
  `
}

function _returnsAgentQuery(noticeType) {
  if (noticeType === NoticeType.INVITATIONS || noticeType === NoticeType.REMINDERS) {
    return `
    SELECT
      NULL::jsonb AS contact,
      md5(LOWER(le."name")) AS contact_hash_id,
      ('returns agent') AS contact_type,
      a.due_date AS due_date,
      a.end_date AS end_date,
      le."name" AS email,
      a.licence_ref,
      ('Email') as message_type,
      a.return_id,
      a.return_reference AS return_reference,
      a.start_date AS start_date,
      2 AS priority
    FROM
      ldh_all a
    INNER JOIN public.licence_entity_roles ler
      ON ler.company_entity_id = a.company_entity_id AND ler."role" = 'user_returns'
    INNER JOIN public.licence_entities le
      ON le.id = ler.licence_entity_id
    `
  }

  return _noRecipientsQuery()
}

function _returnsToQuery(noticeType) {
  if (noticeType !== NoticeType.ALTERNATE_INVITATION) {
    return `
    SELECT
      contacts AS contact,
      (md5(
        LOWER(
          concat(
            contacts->>'salutation',
            contacts->>'forename',
            contacts->>'initials',
            contacts->>'name',
            contacts->>'addressLine1',
            contacts->>'addressLine2',
            contacts->>'addressLine3',
            contacts->>'addressLine4',
            contacts->>'town',
            contacts->>'county',
            contacts->>'postcode',
            contacts->>'country'
          )
        )
      )) AS contact_hash_id,
      ('returns to') AS contact_type,
      a.due_date AS due_date,
      a.end_date AS end_date,
      (NULL) AS email,
      a.licence_ref,
      ('Letter') as message_type,
      a.return_id,
      a.return_reference AS return_reference,
      a.start_date AS start_date,
      4 AS priority
    FROM
      json_contacts a
    LEFT JOIN registered_licences rl ON
      rl.licence_ref = a.licence_ref
    WHERE
      contacts->>'role' = 'Returns to'
      AND rl.licence_ref IS NULL
    `
  }

  return _noRecipientsQuery()
}

module.exports = {
  go
}
