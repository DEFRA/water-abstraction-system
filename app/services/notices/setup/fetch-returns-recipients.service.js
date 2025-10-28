'use strict'

/**
 * Fetches the returns recipients data for the `/notices/setup/check` page
 * @module FetchReturnsRecipientsService
 */

const { db } = require('../../../../db/db.js')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')
const { NoticeType } = require('../../../lib/static-lookups.lib.js')

const featureFlagsConfig = require('../../../../config/feature-flags.config.js')

/**
 * Fetches the returns recipients data for the `/notices/setup/check` page
 *
 * > IMPORTANT! The source for notification contacts is `crm.document_headers` (view `licence_document_headers`), not
 * > the tables in `crm_v2`.
 *
 * Our overall goal is that a 'recipient' receives only one notification, irrespective of how many licences they are
 * linked to, or what roles they have.
 *
 * We have two mechanisms for returning a recipient. One is for an individual licence, based on the 'licenceRef. And
 * the other is for any journey that needs multiple recipients based on the selected returns period.
 *
 * For the individual licence we determine the recipients from the returns logs based on the provided 'licenceRef'.
 *
 * We start by determining which licence we need to send notifications for, by
 * looking for return logs with a matching 'licenceRef' the user has entered.
 *
 * For the multiple recipients journey we start by determining which licences we need to send notifications for, by
 * looking for 'due' return logs with a matching 'due date' and cycle (summer or winter and all year).
 *
 * For each licence linked to one of these return logs, we extract the contact information. This is complicated by a
 * number of factors.
 *
 * - if a licence is _registered_ (more details below), we only care about the email addresses registered against it
 * - all licences should have a 'licence holder' contact, but they may also have a 'returns' contact
 * - there is a one-to-one relationship between `licences` and `licence_document_headers`, but the same contact (licence
 * holder or returns) can appear in different licences, and we are expected to group them into a 'single' contact
 *
 * WRLS has the concept of a registered and unregistered licences:
 *
 * - **Unregistered licences** have not been linked to an external email, so do not have a 'primary user'. All licences
 * have a contact with the role 'Licence holder', so this will be extracted as a 'contact'. They may also have a
 * contact with the role 'Returns to' (but only one), which is extracted as well.
 * - **Registered licences** have been linked to an external email. That initial email will be linked as the 'primary
 * user'. These licences may also have designated other accounts as 'returns agents', which will be extracted as well.
 *
 * If a licence is registered, we only extract the email contacts. Unregistered licences its the 'Licence holder' and
 * 'Returns to' contacts from `licence_document_headers.metadata->contacts`.
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
 * ```json
 * {
 *  "name": "Acme Ltd",
 *  "role": "Licence holder",
 *  "town": "Shifnal",
 *  "type": "Organisation",
 *  "county": "Shropshire",
 *  "country": null,
 *  "forename": null,
 *  "initials": null,
 *  "postcode": "TF11 8UP",
 *  "salutation": null,
 *  "addressLine1": "Cosford Court",
 *  "addressLine2": null,
 *  "addressLine3": null,
 *  "addressLine4": null
 * },
 * {
 *  "name": "ACME Ltd",
 *  "role": "Licence holder",
 *  "town": "Shifnal",
 *  "type": "Organisation",
 *  "county": "SHROPSHIRE",
 *  "country": null,
 *  "forename": null,
 *  "initials": null,
 *  "postcode": "TF11 8UP",
 *  "salutation": null,
 *  "addressLine1": "Cosford Court",
 *  "addressLine2": null,
 *  "addressLine3": null,
 *  "addressLine4": null
 * }
 * ```
 *
 * > The deduping is very basic. We don't account for Ltd vs Limited, FAO Jon vs Jon, etc. But just doing this reduces
 * > the number of recipients receiving duplicate notifications considerably compared to the legacy notification engine.
 *
 * The subquery determines which contacts to return and their hash ID. The top level part of the query then groups these
 * results to remove the first tranche of duplicates. These are where, for example, 10 licences are all linked to the
 * same primary user. Apart from the licence ref, all other fields will be the same. So, PostgreSQL can aggregate the
 * licence refs into a single value, and group the rest into a single row.
 *
 * Those contacts with the same hash ID that cannot be grouped, for example, because one has the `contact_type='Licence
 * holder'` and the other `contact_type='Returns to'` will be handled by `DetermineRecipientsService`.
 *
 * For the individual licence the end result is all the email, or letter contacts for that  licence with a 'due'
 * return for any period.
 *
 * For the multiple recipient journeys the end result is all the email, or letter contacts for each licence with a 'due'
 * return for the period selected.
 *
 * ```javascript
 * [
 *   {
 *     licence_refs: '01/123,01/125,01/126',
 *     contact_type: 'Licence holder',
 *     email: null,
 *     contact: { // as found in metadata },
 *     contact_hash_id: 'ec24af7ca0d9bf99b42bd9a14c709f97'
 *   },
 *   {
 *     licence_refs: '16/167',
 *     contact_type: 'Licence holder',
 *     email: null,
 *     contact: { // as found in metadata },
 *     contact_hash_id: '97bedd3194939dfb1e3c71fe818afcbd'
 *   },
 *   {
 *     licence_refs: '16/167',
 *     contact_type: 'Returns to',
 *     email: null,
 *     contact: { // as found in metadata },
 *     contact_hash_id: 'bc73e796352e116ce86353ae3b2a6074'
 *   },
 *   {
 *     licence_refs: '9/40/05/0014/SR',
 *     contact_type: 'Primary user',
 *     email: 'grozbaz.mogka@bad-moons.co.uk',
 *     contact: null,
 *     contact_hash_id: '75fdc53f15c42d5b6ed8272d621ca9ab'
 *   },
 *   {
 *     licence_refs: '9/40/05/0014/SR',
 *     contact_type: 'Returns agent',
 *     email: 'bolratoff-gazbag@goffs.net',
 *     contact: null},
 *     contact_hash_id: 'bed7b6a023b233a2eb68323a374171c5'
 *   },
 *   {
 *     licence_refs: '2/27/20/037,2/27/20/038',
 *     contact_type: 'Returns agent',
 *     email: 'gartok-ruknot@snakebites.co.uk',
 *     contact: null},
 *     contact_hash_id: '3643e478e7999ff63f491234133e4c56'
 *   }
 * ]
 * ```
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {Promise<object[]>} The contact data for all the outstanding return logs
 */
async function go(session) {
  if (session.licenceRef) {
    return _fetchRecipient(session)
  }

  return _fetchRecipients(session)
}

async function _fetchRecipient(session) {
  const { licenceRef } = session

  const whereLicenceRef = `ldh.licence_ref = ?`

  const bindings = [licenceRef, licenceRef, licenceRef, licenceRef]

  const { rows } = await _fetch(bindings, whereLicenceRef)

  return rows
}

async function _fetchRecipients(session) {
  const {
    determinedReturnsPeriod: { dueDate, endDate, startDate, quarterly, summer },
    noticeType,
    removeLicences = ''
  } = session

  const excludeLicences = transformStringOfLicencesToArray(removeLicences)

  let dueDateCondition = 'IS NULL'

  if (noticeType === NoticeType.REMINDERS) {
    dueDateCondition = 'IS NOT NULL'
  } else if (!featureFlagsConfig.enableNullDueDate) {
    dueDateCondition = '= ?'
  }

  const where = `
    AND rl.due_date ${dueDateCondition}
    AND rl.end_date <= ?
    AND rl.start_date >= ?
    AND rl.metadata->>'isSummer' = ?
    AND rl.quarterly = ?
  `
  const bindings = [
    endDate,
    startDate,
    summer,
    quarterly,
    excludeLicences,
    excludeLicences,
    excludeLicences,
    excludeLicences
  ]

  if (!featureFlagsConfig.enableNullDueDate) {
    bindings.unshift(dueDate)
  }

  const whereLicenceRef = `NOT (ldh.licence_ref = ANY (?))`

  const { rows } = await _fetch(bindings, whereLicenceRef, where)

  return rows
}

async function _fetch(bindings, whereLicenceRef, whereReturnLogs) {
  const query = _query(whereLicenceRef, whereReturnLogs)

  return db.raw(query, bindings)
}

function _query(whereLicenceRef, whereReturnLogs = '') {
  return `
    WITH
      due_return_logs as (
        SELECT
          rl.licence_ref,
          rl.status,
          rl.metadata,
          rl.due_date,
          rl.return_id
        FROM public.return_logs rl
        WHERE
          rl.status = 'due'
          AND rl.metadata->>'isCurrent' = 'true'
          ${whereReturnLogs}
      ),

      primary_user as (
        SELECT
          ldh.licence_ref,
          ('Primary user') AS contact_type,
          le."name" AS email,
          NULL::jsonb AS contact,
          md5(LOWER(le."name")) AS contact_hash_id,
          rl.return_id
        FROM public.licence_document_headers ldh
            INNER JOIN public.licence_entity_roles ler
                ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'primary_user'
            INNER JOIN public.licence_entities le
                ON le.id = ler.licence_entity_id
            INNER JOIN due_return_logs rl
                ON rl.licence_ref = ldh.licence_ref
        WHERE
          ${whereLicenceRef}
      ),

      returns_agent as (
        SELECT
          ldh.licence_ref,
          ('Returns agent') AS contact_type,
          le."name" AS email,
          NULL::jsonb AS contact,
          md5(LOWER(le."name")) AS contact_hash_id,
          rl.return_id
        FROM public.licence_document_headers ldh
            INNER JOIN public.licence_entity_roles ler
                ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'user_returns'
            INNER JOIN public.licence_entities le
                ON le.id = ler.licence_entity_id
            INNER JOIN due_return_logs rl
                ON rl.licence_ref = ldh.licence_ref
        WHERE
          ${whereLicenceRef}
      ),

      -- set of licences that are registered (have a primary user)
      registered_licences AS (
        SELECT DISTINCT licence_ref FROM primary_user
      ),

      licence_holder as (
        SELECT
          ldh.licence_ref,
          ('Licence holder') AS contact_type,
          (NULL) AS email,
          contacts as contact,
          (md5(
            LOWER(
              concat(contacts->>'salutation', contacts->>'forename', contacts->>'initials', contacts->>'name', contacts->>'addressLine1', contacts->>'addressLine2', contacts->>'addressLine3', contacts->>'addressLine4', contacts->>'town', contacts->>'county', contacts->>'postcode', contacts->>'country')
            )
          )) AS contact_hash_id,
          rl.return_id
        FROM public.licence_document_headers ldh
          INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
          INNER JOIN due_return_logs rl
            ON rl.licence_ref = ldh.licence_ref
        WHERE
          ${whereLicenceRef}
          AND contacts->>'role' = 'Licence holder'
          AND NOT EXISTS (
            SELECT 1 FROM registered_licences r
            WHERE r.licence_ref = ldh.licence_ref
            )
      ),

      returns_to as (
        SELECT
          ldh.licence_ref,
          ('Returns to') AS contact_type,
          (NULL) AS email,
          contacts as contact,
          (md5(
            LOWER(
              concat(contacts->>'salutation', contacts->>'forename', contacts->>'initials', contacts->>'name', contacts->>'addressLine1', contacts->>'addressLine2', contacts->>'addressLine3', contacts->>'addressLine4', contacts->>'town', contacts->>'county', contacts->>'postcode', contacts->>'country')
            )
          )) AS contact_hash_id,
          rl.return_id
        FROM public.licence_document_headers ldh
          INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
          INNER JOIN due_return_logs rl
            ON rl.licence_ref = ldh.licence_ref
        WHERE
          ${whereLicenceRef}
          AND contacts->>'role' = 'Returns to'
          AND NOT EXISTS (
            SELECT 1 FROM registered_licences r
            WHERE r.licence_ref = ldh.licence_ref
          )
      ),

      all_contacts AS (
        SELECT *, 1 AS priority FROM primary_user
        UNION ALL
        SELECT *, 2 AS priority FROM returns_agent
        UNION ALL
        SELECT *, 3 AS priority FROM licence_holder
        UNION ALL
        SELECT *, 4 AS priority FROM returns_to
      ),

      best_contact_type AS (
        SELECT DISTINCT ON (contact_hash_id)
          contact_hash_id,
          contact_type,
          email,
          contact,
          priority
        FROM all_contacts
        ORDER BY contact_hash_id, priority
      ),

      -- Aggregate all licence_refs and return_ids per contact_hash_id
      aggregated_contact_data AS (
        SELECT
          contact_hash_id,
          JSON_AGG(DISTINCT licence_ref ORDER BY licence_ref) AS licence_refs,
          JSON_AGG(DISTINCT return_id ORDER BY return_id) AS return_ids
        FROM all_contacts
        GROUP BY contact_hash_id
      )

    SELECT
      a.licence_refs,
      b.contact_type,
      b.email,
      b.contact,
      b.contact_hash_id,
      a.return_ids as return_log_ids
    FROM
      aggregated_contact_data a
        JOIN
      best_contact_type b
      USING (contact_hash_id)
    ORDER BY
      b.email NULLS LAST
`
}

module.exports = {
  go
}
