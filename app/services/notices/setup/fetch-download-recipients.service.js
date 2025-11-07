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

  const bindings = [timestampForPostgres(), licenceRef, licenceRef, licenceRef, licenceRef]

  const whereReturnLogs = 'AND rl.end_date <= ?'
  const whereLicenceRefs = 'rl.licence_ref = ?'

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

  if (!featureFlagsConfig.enableNullDueDate) {
    dueDateCondition = '= ?'
  } else {
    if (noticeType === NoticeType.REMINDERS) {
      dueDateCondition = 'IS NOT NULL'
    } else {
      dueDateCondition = 'IS NULL'
    }
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

  const whereLicenceRefs = 'NOT (ldh.licence_ref = ANY (?))'
  bindings.push(transformStringOfLicencesToArray(removeLicences))
  bindings.push(transformStringOfLicencesToArray(removeLicences))
  bindings.push(transformStringOfLicencesToArray(removeLicences))
  bindings.push(transformStringOfLicencesToArray(removeLicences))

  return {
    bindings,
    whereLicenceRefs,
    whereReturnLogs
  }
}

function _query(whereReturnLogs, whereLicenceRefs) {
  return `
    WITH
      due_return_logs AS (
        SELECT
          rl.licence_ref,
          rl.return_reference,
          rl.start_date,
          rl.end_date,
          rl.due_date
        FROM public.return_logs rl
        WHERE
          rl.status = 'due'
          AND rl.metadata->>'isCurrent' = 'true'
          ${whereReturnLogs}
      ),

      primary_user AS (
        SELECT
          ldh.licence_ref,
          ('Primary user') AS contact_type,
          rl.return_reference AS return_reference,
          rl.start_date AS start_date,
          rl.end_date AS end_date,
          rl.due_date AS due_date,
          le."name" AS email,
          md5(LOWER(le."name")) AS contact_hash_id,
          NULL::jsonb AS contact
        FROM public.licence_document_headers ldh
          INNER JOIN public.licence_entity_roles ler
            ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'primary_user'
          INNER JOIN public.licence_entities le
            ON le.id = ler.licence_entity_id
          INNER JOIN due_return_logs rl
            ON rl.licence_ref = ldh.licence_ref
        WHERE
          ${whereLicenceRefs}
      ),

      returns_agent AS (
        SELECT
          ldh.licence_ref,
          ('Returns agent') AS contact_type,
          rl.return_reference AS return_reference,
          rl.start_date AS start_date,
          rl.end_date AS end_date,
          rl.due_date AS due_date,
          le."name" AS email,
          md5(LOWER(le."name")) AS contact_hash_id,
          NULL::jsonb AS contact
        FROM public.licence_document_headers ldh
          INNER JOIN public.licence_entity_roles ler
            ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'user_returns'
          INNER JOIN public.licence_entities le
            ON le.id = ler.licence_entity_id
          INNER JOIN due_return_logs rl
            ON rl.licence_ref = ldh.licence_ref
        WHERE
          ${whereLicenceRefs}
      ),

      -- set of licences that are registered (have a primary user)
      registered_licences AS (
        SELECT DISTINCT licence_ref FROM primary_user
      ),

      licence_holder AS (
        SELECT
          ldh.licence_ref,
          ('Licence holder') AS contact_type,
          rl.return_reference AS return_reference,
          rl.start_date AS start_date,
          rl.end_date AS end_date,
          rl.due_date AS due_date,
          (NULL) AS email,
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
          contacts AS contact
        FROM public.licence_document_headers ldh
          INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
          INNER JOIN due_return_logs rl
            ON rl.licence_ref = ldh.licence_ref
        WHERE
          ${whereLicenceRefs}
          AND contacts->>'role' = 'Licence holder'
          AND NOT EXISTS (
            SELECT 1 FROM registered_licences r
            WHERE r.licence_ref = ldh.licence_ref
          )
      ),

      returns_to AS (
        SELECT
          ldh.licence_ref,
          ('Returns to') AS contact_type,
          rl.return_reference AS return_reference,
          rl.start_date AS start_date,
          rl.end_date AS end_date,
          rl.due_date AS due_date,
          (NULL) AS email,
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
          contacts AS contact
        FROM public.licence_document_headers ldh
          INNER JOIN LATERAL jsonb_array_elements(ldh.metadata -> 'contacts') AS contacts ON true
          INNER JOIN due_return_logs rl
            ON rl.licence_ref = ldh.licence_ref
        WHERE
          ${whereLicenceRefs}
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
        SELECT DISTINCT ON (licence_ref, contact_hash_id)
          licence_ref,
          contact_hash_id,
          contact_type,
          email,
          contact,
          start_date,
          end_date,
          due_date,
          return_reference,
          priority
        FROM all_contacts
        ORDER BY licence_ref, contact_hash_id, priority
      )

    SELECT
      b.licence_ref,
      b.contact_hash_id,
      b.contact_type,
      b.email,
      b.contact,
      b.start_date,
      b.end_date,
      b.due_date,
      b.return_reference
    FROM best_contact_type b
    ORDER BY
      b.licence_ref NULLS LAST
  `
}

module.exports = {
  go
}
