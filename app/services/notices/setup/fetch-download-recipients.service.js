'use strict'

/**
 * Fetches the recipients data for the `/notices/setup/download` CSV file
 * @module FetchDownloadRecipientsService
 */

const { db } = require('../../../../db/db.js')
const { transformStringOfLicencesToArray, timestampForPostgres } = require('../../../lib/general.lib.js')
const { NoticeType } = require('../../../lib/static-lookups.lib.js')

const featureFlagsConfig = require('../../../../config/feature-flags.config.js')

/**
 * Fetches the recipients data for the `/notices/setup/download` CSV file
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
 * We have another service 'FetchContactsService' which removes duplicate rows by squashing them together. We do not
 * want to remove duplicates for the downloadable recipients. Each row in the CSV file should represent the data
 * received from this query (For either registered or unregistered licences). We expect to see duplicate licences with
 * different contacts types (but still preferring the registered over unregistered licence).
 *
 * @param {module:SessionModel} session - The session instance
 *
 * @returns {Promise<object[]>} - matching recipients
 */
async function go(session) {
  let filters

  if (session.licenceRef) {
    filters = _filterByLicence(session)
  } else {
    filters = _filterByPeriod(session)
  }

  const { rows } = await _fetch(filters)

  return rows
}

async function _fetch(filters) {
  const { bindings, whereLicenceRefs, whereReturnLogs } = filters
  const query = _query(whereReturnLogs, whereLicenceRefs)

  return db.raw(query, bindings)
}

function _filterByLicence(session) {
  const { licenceRef } = session

  const bindings = [timestampForPostgres(), licenceRef]

  const whereReturnLogs = 'AND rl.end_date <= ?'
  const whereLicenceRefs = 'WHERE ldh.licence_ref = ?'

  return {
    bindings,
    whereLicenceRefs,
    whereReturnLogs
  }
}

function _filterByPeriod(session) {
  const {
    determinedReturnsPeriod: { dueDate, endDate, startDate, quarterly, summer },
    noticeType,
    removeLicences = ''
  } = session

  let dueDateCondition

  if (noticeType === NoticeType.REMINDERS) {
    dueDateCondition = 'IS NOT NULL'
  } else if (!featureFlagsConfig.enableNullDueDate) {
    dueDateCondition = '= ?'
  } else {
    dueDateCondition = 'IS NULL'
  }

  const bindings = [startDate, endDate, summer, quarterly]
  const whereReturnLogs = `
    AND start_date >= ?
    AND end_date <= ?
    AND metadata->>'isSummer' = ?
    AND quarterly = ?
    AND due_date ${dueDateCondition}
  `

  if (!featureFlagsConfig.enableNullDueDate) {
    bindings.push(dueDate)
  }

  let whereLicenceRefs = ''
  if (removeLicences !== '') {
    whereLicenceRefs = 'WHERE NOT (ldh.licence_ref = ANY (?))'
    bindings.push(transformStringOfLicencesToArray(removeLicences))
  }

  return {
    bindings,
    whereLicenceRefs,
    whereReturnLogs
  }
}

function _query(whereReturnLogs, whereLicenceRefs) {
  return `
  WITH filtered_returns AS (
    SELECT
      rl.licence_ref,
      rl.return_reference,
      rl.start_date,
      rl.end_date,
      rl.due_date
    FROM
      public.return_logs rl
    WHERE
      rl.status = 'due'
      ${whereReturnLogs}
  ),
  filtered_licence_document_headers AS (
    SELECT
      ldh.licence_ref,
      ldh.metadata,
      ldh.company_entity_id,
      rl.return_reference,
      rl.start_date,
      rl.end_date,
      rl.due_date
    FROM
      public.licence_document_headers ldh
    INNER JOIN filtered_returns rl
      ON rl.licence_ref = ldh.licence_ref
    ${whereLicenceRefs}
  )
  SELECT
    contacts.licence_ref,
    contacts.contact_type,
    contacts.return_reference,
    contacts.start_date,
    contacts.end_date,
    contacts.due_date,
    contacts.email,
    contacts.contact,
    contacts.contact_hash_id
  FROM (
    SELECT DISTINCT
      fldh.licence_ref,
      (contacts->>'role') AS contact_type,
      (NULL) AS email,
      contacts as contact,
      fldh.return_reference,
      fldh.start_date,
      fldh.end_date,
      fldh.due_date,
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
      )) AS contact_hash_id
    FROM
      filtered_licence_document_headers fldh
    INNER JOIN LATERAL jsonb_array_elements(fldh.metadata -> 'contacts') AS contacts
      ON TRUE
    WHERE
      contacts->>'role' IN ('Licence holder', 'Returns to')
      AND NOT EXISTS (
        SELECT 1
        FROM public.licence_entity_roles ler
        WHERE ler.company_entity_id = fldh.company_entity_id
          AND ler."role" IN ('primary_user', 'user_returns')
      )

    UNION ALL

    SELECT
      fldh.licence_ref,
      (CASE
        WHEN ler."role" = 'primary_user' THEN 'Primary user'
        ELSE 'Returns agent'
      END) AS contact_type,
      le."name" AS email,
      (NULL) AS contact,
      fldh.return_reference,
      fldh.start_date,
      fldh.end_date,
      fldh.due_date,
      md5(LOWER(le."name")) AS contact_hash_id
    FROM
      filtered_licence_document_headers fldh
    INNER JOIN public.licence_entity_roles ler
      ON ler.company_entity_id = fldh.company_entity_id
      AND ler."role" IN ('primary_user', 'user_returns')
    INNER JOIN public.licence_entities le
      ON le.id = ler.licence_entity_id
  ) contacts
  ORDER BY
    contacts.licence_ref;
  `
}

module.exports = {
  go
}
