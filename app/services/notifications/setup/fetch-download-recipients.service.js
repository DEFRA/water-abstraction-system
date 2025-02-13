'use strict'

/**
 * Formats the contact data from which recipients will be determined for the `/notifications/setup/download` link
 * @module FetchDownloadRecipientsService
 */

const { db } = require('../../../../db/db.js')
const DetermineReturnsPeriodService = require('./determine-returns-period.service.js')
const { transformStringOfLicencesToArray } = require('../../../lib/general.lib.js')

/**
 * Formats the contact data from which recipients will be determined for the `/notifications/setup/download` link
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
 * We have another service 'FetchContactsService' which removes duplicates rows by squashing them together. We do not
 * want to remove duplicates for the downloadable recipients. Each row in the CSV file should represent the data
 * received from this query (For either registered to unregistered licence). We expect to see duplicate licences with
 * different contacts types (but still preferring the registered over unregistered licence).
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {Promise<object[]>} - matching recipients
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

  const bindings = [licenceRef, licenceRef]

  const { rows } = await _fetch(bindings, where)

  return rows
}

async function _fetchRecipients(session) {
  const { returnsPeriod, summer } = DetermineReturnsPeriodService.go(session.returnsPeriod)

  const removeLicences = transformStringOfLicencesToArray(session.removeLicences)

  const dueDate = returnsPeriod.dueDate

  const where = "AND rl.due_date = ?\n    AND rl.metadata->>'isSummer' = ?\n    AND NOT (ldh.licence_ref = ANY (?))"

  const bindings = [dueDate, summer, removeLicences, dueDate, summer, removeLicences]

  const { rows } = await _fetch(bindings, where)

  return rows
}

async function _fetch(bindings, where) {
  const query = _query(where)

  return db.raw(query, bindings)
}

function _query(additionalWhereClause) {
  return `
SELECT
  contacts.licence_ref,
  contacts.contact_type,
  contacts.return_reference,
  contacts.start_date,
  contacts.end_date,
  contacts.due_date,
  contacts.email,
  contacts.contact
FROM (
  SELECT DISTINCT
    ldh.licence_ref,
    (contacts->>'role') AS contact_type,
    (NULL) AS email,
    contacts as contact,
    rl.return_reference,
    rl.start_date,
    rl.end_date,
    rl.due_date
  FROM public.licence_document_headers ldh
    INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON TRUE
    INNER JOIN public.return_logs rl
        ON rl.licence_ref = ldh.licence_ref
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
    (CASE
      WHEN ler."role" = 'primary_user' THEN 'Primary user'
      ELSE 'Returns agent'
    END) AS contact_type,
    le."name" AS email,
    (NULL) AS contact,
    rl.return_reference,
    rl.start_date,
    rl.end_date,
    rl.due_date
  FROM public.licence_document_headers ldh
  INNER JOIN public.licence_entity_roles ler
    ON ler.company_entity_id = ldh.company_entity_id
    AND ler."role" IN ('primary_user', 'user_returns')
  INNER JOIN public.licence_entities le
    ON le.id = ler.licence_entity_id
  INNER JOIN public.return_logs rl
    ON rl.licence_ref = ldh.licence_ref
  WHERE
    rl.status = 'due'
    AND rl.metadata->>'isCurrent' = 'true'
    ${additionalWhereClause}
) contacts
ORDER BY
contacts.licence_ref`
}

module.exports = {
  go
}
