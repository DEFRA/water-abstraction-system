'use strict'

/**
 * Fetches the letter recipients data for the `/notices/setup/check` page
 * @module FetchLetterRecipientsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the leter recipients data for the `/notices/setup/check` page
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
 * - **Unregistered licences** have not been linked to an external email, so do not have a 'primary user'. All licences
 * have a contact with the role 'Licence holder', so this will be extracted as a 'contact'. They may also have a
 * contact with the role 'Returns to' (but only one), which is extracted as well.
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
 *   }
 * ]
 * ```
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {Promise<object[]>} The contact data for all the outstanding return logs
 */
async function go(session) {
  const { licenceRef } = session

  return _fetchRecipient(licenceRef)
}

async function _fetchRecipient(licenceRef) {
  const bindings = [licenceRef]

  const { rows } = await _fetch(bindings)

  return rows
}

async function _fetch(bindings) {
  const query = _query()

  return db.raw(query, bindings)
}

function _query() {
  return `
  WITH return_logs as (
      SELECT DISTINCT ON (rl.licence_ref)
        rl.licence_ref,
        rl.status,
        rl.metadata,
        rl.due_date
      FROM public.return_logs rl
      WHERE
        rl.status = 'due'
        AND rl.metadata->>'isCurrent' = 'true'
    )
  SELECT
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
    INNER JOIN return_logs
        ON return_logs.licence_ref = ldh.licence_ref
    INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
  WHERE
    ldh.licence_ref = ?
    AND contacts->>'role' IN ('Licence holder', 'Returns to')
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
