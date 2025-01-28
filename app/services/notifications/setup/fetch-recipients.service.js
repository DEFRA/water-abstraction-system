'use strict'

/**
 * Formats data for the `/notifications/setup/review` page
 * @module RecipientsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches recipient data for the `/notifications/setup/review` page.
 *
 * @param {string} dueDate - The due date for the return (used to filter records).
 * @param {string} summer - A flag indicating whether the return is for the summer period (used to filter records).
 *
 * @returns {Promise<Recipient[]>} - A promise that resolves to a list of recipients.
 */
async function go(dueDate, summer) {
  const { rows } = await _fetch(dueDate, summer)

  return rows
}

/**
 * Internal function that executes the database query to retrieve the recipient data.
 *
 * @param {string} dueDate - The due date for the return (used to filter records).
 * @param {string} summer - A flag indicating whether the return is for the summer period (used to filter records).
 *
 * @returns {Promise<object>} The raw database result containing the list of recipients.
 * @private
 */
async function _fetch(dueDate, summer) {
  const query = _query()

  return db.raw(query, [dueDate, summer, dueDate, summer, dueDate, summer])
}

/**
 * Constructs the SQL query string to fetch the recipient data.
 *
 * WRLS has the concept of a registered and unregistered licence:
 * - **Registered licences** are associated with a primary user who has an email address.
 *   These licences may also have multiple returns agents, who may share the same or have different
 *   email addresses compared to the primary user.
 *
 * - **Unregistered licences** are linked to a licence holder, who provides a contact address.
 *   Additionally, unregistered licences may have a 'Returns to' contact, whose contact address
 *   may be the same as, or different from, the licence holder’s.
 *
 * The query is designed to return recipients based on the due date and summer flag. It fetches (in order of preference):
 * - Recipients who are associated with a 'Licence holder' or 'Returns to' role and their contact details.
 * - Primary users, who are considered recipients for email notifications.
 * - Returns agents, who are also considered recipients for email notifications.
 *
 * The query differentiates between different types of recipients (and methods of contact):
 * - **Letter - licence holder**: Only returned for recipients with the 'Licence holder' role.
 * - **Letter - returns to**: Returned for recipients with the 'Returns to' role.
 * - **Email - primary user**: Returned for users with the 'primary_user' role (only email, no contact).
 * - **Email - returns agent**: Returned for users with the 'user_returns' role (only email, no contact).
 *
 * The output will include:
 * - A comma-separated list of licence references.
 * - The message type, which will indicate the mode of communication (either 'Letter' or 'Email').
 * - The recipient’s name (if applicable) or `null` (if the recipient is based on contact data).
 * - The recipient's contact details (only available for roles like 'Licence holder' and 'Returns to').
 * - A unique hash ID for the contact, generated from their details.
 *
 * @returns {string} The SQL query string.
 * @private
 */
function _query() {
  return `SELECT
  string_agg(licence_ref, ',' ORDER BY licence_ref) AS all_licences,
  message_type,
  recipient,
  contact,
  contact_hash_id
FROM (
  SELECT DISTINCT
    ldh.licence_ref,
    (CASE
      WHEN contacts->>'role' = 'Licence holder' THEN 'Letter - licence holder'
      ELSE 'Letter - returns to'
    END) AS message_type,
    (NULL) AS recipient,
    contacts as contact,
    (hashtext(
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
    AND rl.due_date = ?
    AND rl.metadata->>'isCurrent' = 'true'
    AND rl.metadata->>'isSummer' = ?
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
    ('Email - primary user') AS message_type,
    le."name" AS recipient,
    (NULL) AS contact,
    hashtext(LOWER(le."name")) AS contact_hash_id
  FROM public.licence_document_headers ldh
  INNER JOIN public.licence_entity_roles ler
    ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'primary_user'
  INNER JOIN public.licence_entities le
    ON le.id = ler.licence_entity_id
  INNER JOIN public.return_logs rl
    ON rl.licence_ref = ldh.licence_ref
  WHERE
    rl.status = 'due'
    AND rl.due_date = ?
    AND rl.metadata->>'isCurrent' = 'true'
    AND rl.metadata->>'isSummer' = ?
  UNION ALL
  SELECT
    ldh.licence_ref,
    ('Email - returns agent') AS message_type,
    le."name" AS recipient,
    (NULL) AS contact,
    hashtext(LOWER(le."name")) AS contact_hash_id
  FROM public.licence_document_headers ldh
  INNER JOIN public.licence_entity_roles ler
    ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'user_returns'
  INNER JOIN public.licence_entities le
    ON le.id = ler.licence_entity_id
  INNER JOIN public.return_logs rl
    ON rl.licence_ref = ldh.licence_ref
  WHERE
    rl.status = 'due'
    AND rl.due_date = ?
    AND rl.metadata->>'isCurrent' = 'true'
    AND rl.metadata->>'isSummer' = ?
) recipients
GROUP BY
  message_type,
  recipient,
  contact,
  contact_hash_id;`
}

module.exports = {
  go
}

/**
 * @typedef {object} Recipient
 * @property {string} all_licences - A comma-separated list of licences with the same contact.
 * @property {string} message_type - The type of message (e.g., 'Letter - licence holder', 'Email - primary user').
 * @property {string|null} recipient - The name of the recipient, or `null` if not applicable.
 * @property {object | null} contact - The contact details, or `null` if not applicable.
 * @property {string} contact_hash_id - A unique hash ID for the contact, generated from their details.
 */
