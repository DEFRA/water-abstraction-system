'use strict'

/**
 * Formats the contact data from which recipients will be determined for the `/notifications/setup/review` page
 * @module FetchContactsService
 */

const DetermineReturnsPeriodService = require('./determine-returns-period.service.js')
const { db } = require('../../../../db/db.js')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

/**
 * Formats the contact data from which recipients will be determined for the `/notifications/setup/review` page
 *
 * > IMPORTANT! The source for notification contacts is `crm.document_headers` (view `licence_document_headers`), not
 * > the tables in `crm_v2`.
 *
 * Our overall goal is that a 'recipient' receives only one notification, irrespective of how many licences they are
 * linked to, or what roles they have.
 *
 * We have two mechanisms for returning a recipient. One is for the 'ad-hoc' journey which is for an individual licence
 * based on a 'licenceRef'. And the other is for any journey that needs multiple recipients based on the selected
 * returns period.
 *
 * For the 'ad-hoc' journey we determine the recipients from the returns logs based on the provided 'licenceRe'.
 *
 * For the 'ad-hoc' journey we start by determining which licence we need to send a notifications for, by
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
 * For the 'ad-hoc' journey the end result is all the email, or letter contacts for that  licence with a 'due'
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
  if (session.journey === 'ad-hoc') {
    return _fetchRecipient(session)
  }

  return _fetchRecipients(session)
}

async function _fetchRecipient(session) {
  const { licenceRef } = session

  const where = 'AND ldh.licence_ref = ?'

  const bindings = [licenceRef, licenceRef, licenceRef]

  const { rows } = await _fetch(bindings, where)

  return rows
}

async function _fetchRecipients(session) {
  const { returnsPeriod, summer } = DetermineReturnsPeriodService.go(session.returnsPeriod)

  const removeLicences = transformStringOfLicencesToArray(session.removeLicences)

  const dueDate = returnsPeriod.dueDate

  const where = "AND rl.due_date = ?\n    AND rl.metadata->>'isSummer' = ?\n    AND NOT (ldh.licence_ref = ANY (?))"

  const bindings = [dueDate, summer, removeLicences, dueDate, summer, removeLicences, dueDate, summer, removeLicences]

  const { rows } = await _fetch(bindings, where)

  return rows
}

async function _fetch(bindings, where) {
  const query = _query(where)

  return db.raw(query, bindings)
}

function _query(additionalWhereClause) {
  return `SELECT
  string_agg(licence_ref, ',' ORDER BY licence_ref) AS licence_refs,
  contact_type,
  email,
  contact,
  contact_hash_id
FROM (
  SELECT DISTINCT
    ldh.licence_ref,
    (contacts->>'role') AS contact_type,
    (NULL) AS email,
    contacts as contact,
    (md5(
      LOWER(
        concat(contacts->>'salutation', contacts->>'forename', contacts->>'initials', contacts->>'name', contacts->>'addressLine1', contacts->>'addressLine2', contacts->>'addressLine3', contacts->>'addressLine4', contacts->>'town', contacts->>'county', contacts->>'postcode', contacts->>'country')
      )
    )) AS contact_hash_id
  FROM public.licence_document_headers ldh
  INNER JOIN public.return_logs rl
    ON rl.licence_ref = ldh.licence_ref
  INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
  WHERE
    rl.status = 'due'
    AND rl.metadata->>'isCurrent' = 'true'
    ${additionalWhereClause}
    AND contacts->>'role' IN ('Licence holder', 'Returns to')
    AND NOT EXISTS (
      SELECT
        1
      FROM public.licence_entity_roles ler
      WHERE
        ler.company_entity_id = ldh.company_entity_id
        AND ler."role" IN ('primary_user', 'user_returns')
    )
  UNION ALL
  SELECT
    ldh.licence_ref,
    ('Primary user') AS contact_type,
    le."name" AS email,
    (NULL) AS contact,
    md5(LOWER(le."name")) AS contact_hash_id
  FROM public.licence_document_headers ldh
  INNER JOIN public.licence_entity_roles ler
    ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'primary_user'
  INNER JOIN public.licence_entities le
    ON le.id = ler.licence_entity_id
  INNER JOIN public.return_logs rl
    ON rl.licence_ref = ldh.licence_ref
  WHERE
    rl.status = 'due'
    AND rl.metadata->>'isCurrent' = 'true'
    ${additionalWhereClause}
  UNION ALL
  SELECT
    ldh.licence_ref,
    ('Returns agent') AS contact_type,
    le."name" AS email,
    (NULL) AS contact,
    md5(LOWER(le."name")) AS contact_hash_id
  FROM public.licence_document_headers ldh
  INNER JOIN public.licence_entity_roles ler
    ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'user_returns'
  INNER JOIN public.licence_entities le
    ON le.id = ler.licence_entity_id
  INNER JOIN public.return_logs rl
    ON rl.licence_ref = ldh.licence_ref
  WHERE
    rl.status = 'due'
    AND rl.metadata->>'isCurrent' = 'true'
    ${additionalWhereClause}
) contacts
GROUP BY
  contact_type,
  email,
  contact,
  contact_hash_id;`
}

module.exports = {
  go
}
