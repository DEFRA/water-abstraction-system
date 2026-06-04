'use strict'

/**
 * SQL query fragment for fetching additional contact recipient
 *
 * Requires 1 binding: licenceRefs
 */
const additionalContactRecipientQuery = `
    SELECT
      DISTINCT
      ld.licence_ref,
      'additional contact' AS contact_type,
      con.email,
      NULL::jsonb AS contact,
      md5(LOWER(con.email)) AS contact_hash_id,
      ('Email') as message_type
    FROM
      public.licence_documents ld
        INNER JOIN public.licence_document_roles ldr
          ON ldr.licence_document_id = ld.id
        INNER JOIN public.company_contacts cct
          ON cct.company_id = ldr.company_id
        INNER JOIN public.contacts con
          ON con.id = cct.contact_id
        INNER JOIN public.licence_roles lr
          ON lr.id = cct.licence_role_id
    WHERE
      ld.licence_ref = ANY (?)
      AND (
      ldr.end_date IS NULL
        OR ldr.end_date >= CURRENT_DATE
      )
      AND cct.abstraction_alerts = true
      AND cct.deleted_at IS NULL
  `

/**
 * SQL query fragment for fetching licence holder recipients from licence versions
 *
 */
const licenceHolderRecipientQuery = `
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
`

/**
 * SQL query fragment for fetching primary user recipients from licence document headers
 *
 */
const primaryUserRecipientQuery = `
    SELECT
      ('primary user') AS contact_type,
      1 AS priority,
      NULL::jsonb AS contact,
      md5(LOWER(le."name")) AS contact_hash_id,
      le."name" AS email,
      ldh.licence_ref,
      ('Email') AS message_type
    FROM public.licence_document_headers ldh
    INNER JOIN public.licence_entity_roles ler
      ON ler.company_entity_id = ldh.company_entity_id AND ler."role" = 'primary_user'
    INNER JOIN public.licence_entities le
      ON le.id = ler.licence_entity_id
`

module.exports = {
  additionalContactRecipientQuery,
  licenceHolderRecipientQuery,
  primaryUserRecipientQuery
}
