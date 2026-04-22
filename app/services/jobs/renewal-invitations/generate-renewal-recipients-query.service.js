'use strict'

/**
 * Generates the SQL query for renewal invitations
 * @module GenerateRenewalRecipientsQueryService
 */

/**
 * Generates the SQL query for renewal invitations
 *
 * When fetching renewal invitation recipients, we are only concerned with the licence holder and/or primary user.
 *
 * When a licence is registered, then a primary user will exist; when this is the case, we return the primary user and
 * not the licence holder.
 *
 * If the licence is not registered, then we return the licence holder.
 */
function go() {
  const licenceHolderQuery = _licenceHolderQuery()
  const primaryUserQuery = _primaryUserQuery()
  const processQuery = _processForSending()

  return `
    WITH
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
    SELECT
      ('licence holder') AS contact_type,
      2 AS priority,
      jsonb_build_object(
        'name', c.name,
        'address1', a.address_1,
        'address2', a.address_2,
        'address3', a.address_3,
        'address4', a.address_4,
        'address5', a.address_5,
        'address6', a.address_6,
        'postcode', a.postcode,
        'country', a.country
      ) AS contact,
      MD5(LOWER(CONCAT(
        c.name,
        a.address_1,
        a.address_2,
        a.address_3,
        a.address_4,
        a.address_5,
        a.address_6,
        a.postcode,
        a.country
      ))) AS contact_hash_id,
      NULL::TEXT AS email,
      l.licence_ref,
      ('Letter') AS message_type
    FROM
      public.licences l
    INNER JOIN (
      SELECT DISTINCT ON (lv.licence_id)
        lv.licence_id,
        lv.company_id,
        lv.address_id
      FROM
        public.licence_versions lv
      WHERE
        lv.start_date <= CURRENT_DATE
      ORDER BY
        lv.licence_id ASC,
        lv."issue" DESC,
        lv."increment" DESC,
        lv.end_date DESC NULLS FIRST
    ) AS llv ON llv.licence_id = l.id
    INNER JOIN public.companies c ON c.id = llv.company_id
    INNER JOIN public.addresses a ON a.id = llv.address_id
    LEFT JOIN registered_licences rl
      ON rl.licence_ref = l.licence_ref
    WHERE
      l.expired_date = ?
    AND rl.licence_ref IS NULL
  `
}

function _primaryUserQuery() {
  return `
    SELECT
      ('primary user') AS contact_type,
      1 AS priority,
      NULL::jsonb AS contact,
      md5(LOWER(le."name")) AS contact_hash_id,
      le."name" AS email,
      ldh.licence_ref,
      ('Email') as message_type
    FROM public.licence_document_headers ldh
    INNER JOIN public.licence_entity_roles ler
      ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'primary_user'
    INNER JOIN public.licence_entities le
      ON le.id = ler.licence_entity_id
    INNER JOIN public.licences l
      ON l.licence_ref = ldh.licence_ref
    WHERE l.expired_date = ?
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
