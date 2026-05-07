'use strict'

/**
 * Generates the SQL query for renewal invitations
 * @module GenerateRenewalRecipientsQueryService
 */

const { licenceHolderRecipientQuery } = require('../../../dal/licences/licence-holder-recipient-query.dal.js')
const { primaryUserRecipientQuery } = require('../../../dal/licences/primary-user-recipient-query.dal.js')

/**
 * Generates the SQL query for renewal invitations
 *
 * When fetching renewal invitation recipients, we are only concerned with the licence holder and/or primary user.
 *
 * When a licence is registered, then a primary user will exist; when this is the case, we return the primary user and
 * not the licence holder.
 *
 * If the licence is not registered, then we return the licence holder.
 *
 * @param {string} expiredLicencesQuery - The query to return all expired licences
 *
 * @returns {string} the SQL query for all renewal recipients with expired licences
 */
function go(expiredLicencesQuery) {
  const licenceHolderQuery = _licenceHolderQuery()
  const primaryUserQuery = _primaryUserQuery()
  const processQuery = _processForSending()

  return `
    WITH
      expiring_licences AS (
        ${expiredLicencesQuery}
      ),
      primary_user as (
        ${primaryUserQuery}
      ),
      -- Which licences are registered (have a primary user). This CTE is used in the next CTE to filter out
      -- records linked to licences that are registered.
      registered_licences AS (
        SELECT DISTINCT licence_ref FROM primary_user
      ),
      licence_holder as (
        ${licenceHolderQuery}
      ),
      all_contacts AS (
        SELECT * FROM primary_user
        UNION ALL
        SELECT * FROM licence_holder
      ),
      ${processQuery}

      SELECT * FROM results;
    `
}

function _licenceHolderQuery() {
  return `
    ${licenceHolderRecipientQuery}
    INNER JOIN expiring_licences el
      ON el.licence_ref = l.licence_ref
    LEFT JOIN registered_licences rl
      ON rl.licence_ref = l.licence_ref
    WHERE rl.licence_ref IS NULL
  `
}

function _primaryUserQuery() {
  return `
    ${primaryUserRecipientQuery}
    INNER JOIN expiring_licences el
      ON el.licence_ref = ldh.licence_ref
  `
}

function _processForSending() {
  return `
  -- PROCESS FOR SENDING NOTICES

  -- Aggregate all licence_refs per contact_hash_id
  aggregated_contact_data AS (
    SELECT
      contact_hash_id,
      JSONB_AGG(DISTINCT licence_ref ORDER BY licence_ref) AS licence_refs
    FROM all_contacts
    GROUP BY contact_hash_id
  ),

  -- Select the highest priority contact details (Email > Letter)
  -- and join the aggregated licence list
  results AS (
    SELECT DISTINCT ON (ac.contact_hash_id)
      ac.contact,
      ac.contact_hash_id,
      ac.contact_type,
      ac.email,
      acd.licence_refs,
      ac.message_type
    FROM
      all_contacts ac
    INNER JOIN aggregated_contact_data acd
      ON acd.contact_hash_id = ac.contact_hash_id
    ORDER BY
      ac.contact_hash_id,
      ac.priority ASC
  )
  `
}

module.exports = {
  go
}
